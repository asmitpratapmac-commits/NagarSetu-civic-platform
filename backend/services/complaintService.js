const Complaint = require('../models/Complaint');
const Department = require('../models/Department');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const aiService = require('./aiService');
const slaService = require('./slaService');
const notificationService = require('./notificationService');
const auditService = require('./auditService');
const { STATUS_TRANSITIONS, SOCKET_EVENTS } = require('../config/constants');

/**
 * Creates a complaint from citizen input, then kicks off AI analysis
 * (category/severity/department/duplicate prediction) synchronously so the
 * complaint is returned to the client already enriched. If the AI service is
 * unreachable, aiService returns safe fallbacks so this never blocks submission.
 */
const createComplaint = async ({ citizenId, title, description, category, address, latitude, longitude, media }, io) => {
  // 1. Create with status "Submitted" and a provisional severity so SLA math has something to work with.
  const complaint = await Complaint.create({
    title,
    description,
    category: category || 'Other',
    address,
    location: { type: 'Point', coordinates: [longitude, latitude] },
    media: media || [],
    reportedBy: citizenId,
    status: 'AI Analyzing',
    timeline: [
      { status: 'Submitted', actorRole: 'citizen', actor: citizenId, note: 'Complaint submitted by citizen.' },
      { status: 'AI Analyzing', actorRole: 'system', note: 'Handed off to AI service for analysis.' },
    ],
  });

  // 2. Run AI prediction (category, severity, department, summary, recommended action, duplicates)
  const nearbyForDuplicateCheck = await Complaint.find({
    _id: { $ne: complaint._id },
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: 500, // meters
      },
    },
  })
    .limit(10)
    .select('title description category');

  const prediction = await aiService.predictComplaint({
    title,
    description,
    category,
    imageUrl: media && media[0] ? media[0].url : null,
    existingComplaints: nearbyForDuplicateCheck.map((c) => ({
      id: c._id.toString(),
      title: c.title,
      description: c.description,
    })),
  });

  // 3. Resolve predicted department -> real Department doc via category mapping
  let departmentDoc = null;
  const resolvedCategory = prediction.category || category || 'Other';
  departmentDoc = await Department.findOne({ categories: resolvedCategory, isActive: true });

  complaint.category = resolvedCategory;
  complaint.severity = prediction.severity || 'Medium';
  complaint.department = departmentDoc ? departmentDoc._id : null;
  complaint.ai = {
    isAnalyzed: true,
    predictedCategory: resolvedCategory,
    predictedSeverity: prediction.severity || 'Medium',
    predictedDepartment: departmentDoc ? departmentDoc._id : null,
    confidence: prediction.confidence || 0,
    summary: prediction.summary || '',
    recommendedAction: prediction.recommendedAction || '',
    duplicateCandidates: (prediction.duplicateCandidates || []).map((d) => ({
      complaint: d.id,
      similarity: d.similarity,
    })),
    rawResponse: prediction,
    analyzedAt: new Date(),
  };
  complaint.status = 'Submitted'; // back to Submitted; auto-assignment (below) may move it to Assigned
  complaint.timeline.push({
    status: 'Submitted',
    actorRole: 'ai',
    note: `AI analysis complete: category=${resolvedCategory}, severity=${complaint.severity}, confidence=${(prediction.confidence * 100).toFixed(0)}%`,
  });

  await complaint.save(); // pre-save hook recalculates slaDeadline from severity

  // 4. Notify department head / admins that a new complaint needs attention
  if (departmentDoc && departmentDoc.headOfDepartment) {
    await notificationService.create({
      recipient: departmentDoc.headOfDepartment,
      type: 'complaint_submitted',
      title: 'New complaint in your department',
      message: `"${title}" was just submitted and assigned to ${departmentDoc.name}.`,
      relatedComplaint: complaint._id,
      priority: complaint.severity === 'Critical' ? 'high' : 'normal',
      io,
    });
  }

  if (io) io.emit(SOCKET_EVENTS.COMPLAINT_CREATED, { id: complaint._id, severity: complaint.severity });

  return complaint;
};

const getComplaintById = async (id) => {
  const complaint = await Complaint.findById(id)
    .populate('reportedBy', 'name email avatar')
    .populate('assignedTo', 'name email designation')
    .populate('department', 'name code')
    .populate('comments.author', 'name role avatar');
  if (!complaint) throw ApiError.notFound('Complaint not found.');
  return complaint;
};

/**
 * Builds a Mongo filter + geo query from validated query params and returns
 * a paginated result. Used by citizen ("my complaints"), authority ("assigned"),
 * and admin ("all complaints") list views — the caller narrows via `baseFilter`.
 */
const listComplaints = async (query, baseFilter = {}) => {
  const { status, category, severity, department, page = 1, limit = 20, lat, lng, radiusKm, search } = query;

  const filter = { ...baseFilter };
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (severity) filter.severity = severity;
  if (department) filter.department = department;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  if (lat !== undefined && lng !== undefined) {
    filter.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: (radiusKm || 5) * 1000,
      },
    };
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Complaint.find(filter)
      .populate('reportedBy', 'name avatar')
      .populate('assignedTo', 'name designation')
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Complaint.countDocuments(filter),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

/**
 * Assigns (or reassigns) a complaint to an authority officer.
 * Records history in Assignment collection, updates Complaint, notifies the officer.
 */
const assignComplaint = async ({ complaintId, assignedTo, assignedBy, note, reason = 'manual_assignment' }, io) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw ApiError.notFound('Complaint not found.');

  const officer = await User.findById(assignedTo);
  if (!officer || officer.role !== 'authority') {
    throw ApiError.badRequest('assignedTo must reference a valid authority user.');
  }

  // Deactivate any currently-active assignment before creating a new one
  await Assignment.updateMany(
    { complaint: complaint._id, isActive: true },
    { isActive: false, unassignedAt: new Date() }
  );

  await Assignment.create({
    complaint: complaint._id,
    assignedTo,
    assignedBy,
    department: complaint.department,
    reason,
    note: note || '',
  });

  complaint.assignedTo = assignedTo;
  complaint.assignedAt = new Date();
  if (complaint.status === 'Submitted' || complaint.status === 'AI Analyzing') {
    complaint.status = 'Assigned';
  }
  complaint.timeline.push({
    status: 'Assigned',
    actor: assignedBy,
    actorRole: 'admin',
    note: note || `Assigned to ${officer.name}.`,
  });
  await complaint.save();

  await notificationService.create({
    recipient: assignedTo,
    type: 'complaint_assigned',
    title: 'New complaint assigned to you',
    message: `"${complaint.title}" has been assigned to you.`,
    relatedComplaint: complaint._id,
    priority: complaint.severity === 'Critical' ? 'high' : 'normal',
    io,
  });

  if (io) io.to(`user:${assignedTo}`).emit(SOCKET_EVENTS.COMPLAINT_ASSIGNED, { complaintId: complaint._id });

  return complaint;
};

/**
 * Validates and applies a status transition according to STATUS_TRANSITIONS.
 * Resolving requires separate `resolveComplaint` (enforces evidence upload).
 */
const updateStatus = async ({ complaintId, newStatus, actorId, actorRole, note }, io) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw ApiError.notFound('Complaint not found.');

  if (newStatus === 'Resolved') {
    throw ApiError.badRequest('Use the dedicated resolve endpoint to mark a complaint resolved (evidence required).');
  }

  const allowedNext = STATUS_TRANSITIONS[complaint.status] || [];
  if (!allowedNext.includes(newStatus)) {
    throw ApiError.badRequest(`Cannot transition from "${complaint.status}" to "${newStatus}".`);
  }

  complaint.status = newStatus;
  complaint.timeline.push({ status: newStatus, actor: actorId, actorRole, note: note || '' });
  await complaint.save();

  await notificationService.create({
    recipient: complaint.reportedBy,
    type: 'status_changed',
    title: 'Your complaint status was updated',
    message: `"${complaint.title}" is now "${newStatus}".`,
    relatedComplaint: complaint._id,
    io,
  });

  if (io) {
    io.emit(SOCKET_EVENTS.COMPLAINT_STATUS_CHANGED, { complaintId: complaint._id, status: newStatus });
  }

  return complaint;
};

/**
 * Marks a complaint resolved. HARD REQUIREMENT: at least one resolution evidence
 * file must already be attached (uploaded via a separate evidence-upload call)
 * before this can succeed — enforced here, not just at the schema level.
 */
const resolveComplaint = async ({ complaintId, resolvedBy, resolutionNote }, io) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw ApiError.notFound('Complaint not found.');

  if (!complaint.resolutionEvidence || complaint.resolutionEvidence.length === 0) {
    throw ApiError.badRequest(
      'Cannot mark complaint resolved without uploading resolution evidence (before/after photos).'
    );
  }
  if (!['In Progress', 'Assigned'].includes(complaint.status)) {
    throw ApiError.badRequest(`Cannot resolve a complaint in status "${complaint.status}".`);
  }

  complaint.status = 'Pending Verification';
  complaint.resolutionNote = resolutionNote;
  complaint.resolvedAt = new Date();
  complaint.resolvedBy = resolvedBy;
  complaint.verification.isConfirmedByCitizen = null;
  complaint.timeline.push({
    status: 'Pending Verification',
    actor: resolvedBy,
    actorRole: 'authority',
    note: resolutionNote,
  });
  await complaint.save();

  await notificationService.create({
    recipient: complaint.reportedBy,
    type: 'verification_requested',
    title: 'Please confirm your complaint was resolved',
    message: `The reported issue "${complaint.title}" has been marked resolved. Please confirm.`,
    relatedComplaint: complaint._id,
    priority: 'normal',
    io,
  });

  if (io) io.emit(SOCKET_EVENTS.COMPLAINT_RESOLVED, { complaintId: complaint._id });

  return complaint;
};

/**
 * Citizen confirms or rejects a resolution. Rejecting reopens the complaint
 * (up to Settings.general.maxReopenCount times) and re-notifies the officer.
 */
const verifyResolution = async ({ complaintId, citizenId, isConfirmed, citizenFeedback, reopenReason }, io) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw ApiError.notFound('Complaint not found.');
  if (complaint.reportedBy.toString() !== citizenId.toString()) {
    throw ApiError.forbidden('Only the original reporter can verify this complaint.');
  }
  if (complaint.status !== 'Pending Verification') {
    throw ApiError.badRequest('Complaint is not currently pending verification.');
  }

  complaint.verification.confirmedAt = new Date();
  complaint.verification.citizenFeedback = citizenFeedback || '';

  if (isConfirmed) {
    complaint.verification.isConfirmedByCitizen = true;
    complaint.status = 'Resolved';
    complaint.timeline.push({
      status: 'Resolved',
      actor: citizenId,
      actorRole: 'citizen',
      note: 'Citizen confirmed the issue was resolved.',
    });

    await User.findByIdAndUpdate(citizenId, { $inc: { 'stats.resolvedComplaints': 1 } });
  } else {
    complaint.verification.isConfirmedByCitizen = false;
    complaint.verification.reopenReason = reopenReason || '';
    complaint.verification.reopenCount += 1;
    complaint.status = 'Reopened';
    complaint.timeline.push({
      status: 'Reopened',
      actor: citizenId,
      actorRole: 'citizen',
      note: reopenReason || 'Citizen reported the issue was not actually resolved.',
    });

    if (complaint.assignedTo) {
      await notificationService.create({
        recipient: complaint.assignedTo,
        type: 'complaint_reopened',
        title: 'Complaint reopened by citizen',
        message: `"${complaint.title}" was reopened — the citizen says the issue is not resolved.`,
        relatedComplaint: complaint._id,
        priority: 'high',
        io,
      });
    }
  }

  await complaint.save();
  return complaint;
};

const addComment = async ({ complaintId, authorId, authorRole, message, attachments }, io) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw ApiError.notFound('Complaint not found.');

  complaint.comments.push({ author: authorId, authorRole, message, attachments: attachments || [] });
  await complaint.save();

  const notifyTarget = authorRole === 'citizen' ? complaint.assignedTo : complaint.reportedBy;
  if (notifyTarget) {
    await notificationService.create({
      recipient: notifyTarget,
      type: 'new_comment',
      title: 'New comment on a complaint',
      message: `New comment on "${complaint.title}".`,
      relatedComplaint: complaint._id,
      io,
    });
  }

  if (io) io.emit(SOCKET_EVENTS.NEW_COMMENT, { complaintId: complaint._id });

  return complaint;
};

/**
 * Admin-only override — bypasses normal status-transition rules but is fully audit-logged.
 */
const adminOverrideStatus = async ({ complaintId, newStatus, adminId, reason }) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw ApiError.notFound('Complaint not found.');

  const before = { status: complaint.status };
  complaint.status = newStatus;
  complaint.timeline.push({
    status: newStatus,
    actor: adminId,
    actorRole: 'admin',
    note: `Admin override: ${reason}`,
  });
  await complaint.save();

  await auditService.log({
    actor: adminId,
    actorRole: 'admin',
    action: 'COMPLAINT_STATUS_OVERRIDE',
    targetType: 'Complaint',
    targetId: complaint._id,
    beforeState: before,
    afterState: { status: newStatus },
    reason,
  });

  return complaint;
};

const overrideSeverity = async ({ complaintId, severity, adminId, reason }) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw ApiError.notFound('Complaint not found.');

  const before = { severity: complaint.severity, slaDeadline: complaint.slaDeadline };
  complaint.severity = severity; // pre-save hook recalculates SLA deadline
  await complaint.save();

  await auditService.log({
    actor: adminId,
    actorRole: 'admin',
    action: 'COMPLAINT_SEVERITY_OVERRIDE',
    targetType: 'Complaint',
    targetId: complaint._id,
    beforeState: before,
    afterState: { severity: complaint.severity, slaDeadline: complaint.slaDeadline },
    reason,
  });

  return complaint;
};

/**
 * Geo query for "nearby complaints" shown to citizens exploring their area.
 */
const getNearbyComplaints = async ({ lat, lng, radiusKm = 3, limit = 50 }) => {
  return Complaint.find({
    isPublic: true,
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radiusKm * 1000,
      },
    },
  })
    .limit(limit)
    .select('title category severity status location address createdAt');
};

/**
 * Aggregates complaint density by rounded grid cell to power the hotspot map layer.
 */
const getHotspots = async ({ category, severity } = {}) => {
  const match = {};
  if (category) match.category = category;
  if (severity) match.severity = severity;

  return Complaint.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          lat: { $round: [{ $arrayElemAt: ['$location.coordinates', 1] }, 3] },
          lng: { $round: [{ $arrayElemAt: ['$location.coordinates', 0] }, 3] },
        },
        count: { $sum: 1 },
        categories: { $addToSet: '$category' },
        criticalCount: {
          $sum: { $cond: [{ $eq: ['$severity', 'Critical'] }, 1, 0] },
        },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 200 },
  ]);
};

const upvoteComplaint = async ({ complaintId, userId }) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw ApiError.notFound('Complaint not found.');

  const alreadyUpvoted = complaint.upvotedBy.some((id) => id.toString() === userId.toString());
  if (alreadyUpvoted) {
    complaint.upvotedBy.pull(userId);
    complaint.upvoteCount = Math.max(0, complaint.upvoteCount - 1);
  } else {
    complaint.upvotedBy.push(userId);
    complaint.upvoteCount += 1;
  }
  await complaint.save();
  return complaint;
};

module.exports = {
  createComplaint,
  getComplaintById,
  listComplaints,
  assignComplaint,
  updateStatus,
  resolveComplaint,
  verifyResolution,
  addComment,
  adminOverrideStatus,
  overrideSeverity,
  getNearbyComplaints,
  getHotspots,
  upvoteComplaint,
};
