const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Department = require('../models/Department');

/**
 * Admin command-center summary: the headline numbers.
 */
const getAdminSummary = async () => {
  const [
    total,
    open,
    resolved,
    overdue,
    critical,
    activeUsers,
    citizenCount,
    authorityCount,
  ] = await Promise.all([
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: { $nin: ['Resolved', 'Rejected'] } }),
    Complaint.countDocuments({ status: 'Resolved' }),
    Complaint.countDocuments({ isOverdue: true, status: { $nin: ['Resolved', 'Rejected'] } }),
    Complaint.countDocuments({ severity: 'Critical', status: { $nin: ['Resolved', 'Rejected'] } }),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'citizen' }),
    User.countDocuments({ role: 'authority' }),
  ]);

  return { total, open, resolved, overdue, critical, activeUsers, citizenCount, authorityCount };
};

/**
 * Complaint volume trend over the last N days — for a line chart.
 */
const getComplaintTrend = async (days = 30) => {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return Complaint.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        submitted: { $sum: 1 },
        resolved: {
          $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

/**
 * Category distribution — for a pie/bar chart.
 */
const getCategoryDistribution = async () => {
  return Complaint.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
};

/**
 * Severity distribution.
 */
const getSeverityDistribution = async () => {
  return Complaint.aggregate([
    { $group: { _id: '$severity', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
};

/**
 * Per-department performance table for admin analytics.
 */
const getDepartmentPerformance = async () => {
  return Department.find().select('name code performance').sort({ 'performance.totalAssigned': -1 });
};

/**
 * AI-specific stats: how often AI predictions matched final outcomes, avg confidence, etc.
 * Kept simple/heuristic since no ground-truth labeling pipeline exists yet.
 */
const getAiStats = async () => {
  const [analyzed, avgConfidenceAgg, autoAssigned] = await Promise.all([
    Complaint.countDocuments({ 'ai.isAnalyzed': true }),
    Complaint.aggregate([
      { $match: { 'ai.isAnalyzed': true } },
      { $group: { _id: null, avgConfidence: { $avg: '$ai.confidence' } } },
    ]),
    Complaint.countDocuments({ 'ai.predictedDepartment': { $ne: null } }),
  ]);

  return {
    totalAnalyzed: analyzed,
    avgConfidence: avgConfidenceAgg[0] ? Number((avgConfidenceAgg[0].avgConfidence * 100).toFixed(1)) : 0,
    autoAssignedCount: autoAssigned,
  };
};

/**
 * Authority dashboard summary — scoped to one officer.
 */
const getAuthoritySummary = async (officerId) => {
  const [assigned, pending, critical, overdue, resolvedByMe, today] = await Promise.all([
    Complaint.countDocuments({ assignedTo: officerId, status: { $nin: ['Resolved', 'Rejected'] } }),
    Complaint.countDocuments({ assignedTo: officerId, status: { $in: ['Assigned', 'In Progress'] } }),
    Complaint.countDocuments({ assignedTo: officerId, severity: 'Critical', status: { $nin: ['Resolved', 'Rejected'] } }),
    Complaint.countDocuments({ assignedTo: officerId, isOverdue: true, status: { $nin: ['Resolved', 'Rejected'] } }),
    Complaint.countDocuments({ assignedTo: officerId, status: 'Resolved' }),
    Complaint.countDocuments({
      assignedTo: officerId,
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    }),
  ]);

  return { assigned, pending, critical, overdue, resolvedByMe, today };
};

/**
 * Citizen dashboard summary — scoped to one citizen.
 */
const getCitizenSummary = async (citizenId) => {
  const [total, active, resolved, pendingVerification] = await Promise.all([
    Complaint.countDocuments({ reportedBy: citizenId }),
    Complaint.countDocuments({ reportedBy: citizenId, status: { $nin: ['Resolved', 'Rejected'] } }),
    Complaint.countDocuments({ reportedBy: citizenId, status: 'Resolved' }),
    Complaint.countDocuments({ reportedBy: citizenId, status: 'Pending Verification' }),
  ]);

  return { total, active, resolved, pendingVerification };
};

module.exports = {
  getAdminSummary,
  getComplaintTrend,
  getCategoryDistribution,
  getSeverityDistribution,
  getDepartmentPerformance,
  getAiStats,
  getAuthoritySummary,
  getCitizenSummary,
};
