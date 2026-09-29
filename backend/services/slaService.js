const Complaint = require('../models/Complaint');
const Settings = require('../models/Settings');
const notificationService = require('./notificationService');
const logger = require('../utils/logger');

/**
 * Reads SLA hours for a severity from Settings (admin-configurable),
 * falling back to the schema defaults if Settings hasn't been initialized yet.
 */
const getSlaHoursForSeverity = async (severity) => {
  const settings = await Settings.findOne({ key: 'app_settings' });
  if (settings && settings.slaRules && settings.slaRules[severity]) {
    return settings.slaRules[severity];
  }
  return Complaint.SLA_HOURS[severity] || Complaint.SLA_HOURS.Medium;
};

const computeDeadline = (createdAt, hours) => {
  return new Date(new Date(createdAt).getTime() + hours * 60 * 60 * 1000);
};

/**
 * Scans all open complaints, flags overdue ones, and escalates complaints
 * that have been overdue without escalation yet. Designed to be run on an
 * interval (see server.js) — e.g. every 15 minutes.
 */
const runSlaSweep = async (io) => {
  const openStatuses = ['Submitted', 'AI Analyzing', 'Assigned', 'In Progress', 'Pending Verification'];
  const now = new Date();

  const overdueComplaints = await Complaint.find({
    status: { $in: openStatuses },
    slaDeadline: { $lte: now },
  }).populate('assignedTo department reportedBy');

  for (const complaint of overdueComplaints) {
    if (!complaint.isOverdue) {
      complaint.isOverdue = true;
    }

    if (!complaint.escalated) {
      complaint.escalated = true;
      complaint.escalatedAt = now;
      complaint.timeline.push({
        status: complaint.status,
        note: 'Automatically escalated — SLA deadline exceeded.',
        actorRole: 'system',
        createdAt: now,
      });

      // Notify the assigned officer + department head (if resolvable) + all admins is handled
      // at a higher level in a real system; here we notify the assignee directly.
      if (complaint.assignedTo) {
        await notificationService.create({
          recipient: complaint.assignedTo._id,
          type: 'sla_warning',
          title: 'SLA deadline exceeded',
          message: `Complaint "${complaint.title}" has exceeded its SLA deadline and has been escalated.`,
          relatedComplaint: complaint._id,
          priority: 'high',
          io,
        });
      }
    }

    await complaint.save();
  }

  if (overdueComplaints.length > 0) {
    logger.info(`SLA sweep: flagged/escalated ${overdueComplaints.length} overdue complaint(s).`);
  }

  return overdueComplaints.length;
};

module.exports = { getSlaHoursForSeverity, computeDeadline, runSlaSweep };
