const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const complaintService = require('../services/complaintService');
const Complaint = require('../models/Complaint');

const create = asyncHandler(async (req, res) => {
  const { title, description, category, address, latitude, longitude } = req.body;
  const media = (req.files || []).map((f) => ({
    url: f.path,
    publicId: f.filename,
    type: f.mimetype.startsWith('video') ? 'video' : 'image',
  }));

  const complaint = await complaintService.createComplaint(
    { citizenId: req.user._id, title, description, category, address, latitude, longitude, media },
    req.io
  );
  return new ApiResponse(201, complaint, 'Complaint submitted and analyzed.').send(res);
});

const getById = asyncHandler(async (req, res) => {
  const complaint = await complaintService.getComplaintById(req.params.id);
  return new ApiResponse(200, complaint, 'Complaint fetched.').send(res);
});

const listMine = asyncHandler(async (req, res) => {
  const result = await complaintService.listComplaints(req.query, { reportedBy: req.user._id });
  return new ApiResponse(200, result.items, 'Your complaints fetched.', {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  }).send(res);
});

const listAssignedToMe = asyncHandler(async (req, res) => {
  const result = await complaintService.listComplaints(req.query, { assignedTo: req.user._id });
  return new ApiResponse(200, result.items, 'Assigned complaints fetched.', {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  }).send(res);
});

const listAll = asyncHandler(async (req, res) => {
  const result = await complaintService.listComplaints(req.query);
  return new ApiResponse(200, result.items, 'All complaints fetched.', {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  }).send(res);
});

const assign = asyncHandler(async (req, res) => {
  const { assignedTo, note } = req.body;
  const complaint = await complaintService.assignComplaint(
    { complaintId: req.params.id, assignedTo, assignedBy: req.user._id, note },
    req.io
  );
  return new ApiResponse(200, complaint, 'Complaint assigned.').send(res);
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const complaint = await complaintService.updateStatus(
    { complaintId: req.params.id, newStatus: status, actorId: req.user._id, actorRole: req.user.role, note },
    req.io
  );
  return new ApiResponse(200, complaint, 'Status updated.').send(res);
});

/**
 * Uploads before/after resolution evidence — must happen BEFORE resolve() can succeed.
 */
const uploadResolutionEvidence = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw ApiError.notFound('Complaint not found.');

  const media = (req.files || []).map((f) => ({
    url: f.path,
    publicId: f.filename,
    type: f.mimetype.startsWith('video') ? 'video' : 'image',
  }));
  if (media.length === 0) {
    throw ApiError.badRequest('At least one evidence file is required.');
  }

  complaint.resolutionEvidence.push(...media);
  await complaint.save();
  return new ApiResponse(200, complaint, 'Resolution evidence uploaded.').send(res);
});

const resolve = asyncHandler(async (req, res) => {
  const { resolutionNote } = req.body;
  const complaint = await complaintService.resolveComplaint(
    { complaintId: req.params.id, resolvedBy: req.user._id, resolutionNote },
    req.io
  );
  return new ApiResponse(200, complaint, 'Complaint marked resolved, pending citizen verification.').send(res);
});

const verify = asyncHandler(async (req, res) => {
  const { isConfirmed, citizenFeedback, reopenReason } = req.body;
  const complaint = await complaintService.verifyResolution(
    { complaintId: req.params.id, citizenId: req.user._id, isConfirmed, citizenFeedback, reopenReason },
    req.io
  );
  return new ApiResponse(200, complaint, isConfirmed ? 'Resolution confirmed. Thank you!' : 'Complaint reopened.').send(res);
});

const comment = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const complaint = await complaintService.addComment(
    { complaintId: req.params.id, authorId: req.user._id, authorRole: req.user.role, message },
    req.io
  );
  return new ApiResponse(201, complaint, 'Comment added.').send(res);
});

const adminOverrideStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  const complaint = await complaintService.adminOverrideStatus({
    complaintId: req.params.id,
    newStatus: status,
    adminId: req.user._id,
    reason,
  });
  return new ApiResponse(200, complaint, 'Status overridden by admin.').send(res);
});

const overrideSeverity = asyncHandler(async (req, res) => {
  const { severity, reason } = req.body;
  const complaint = await complaintService.overrideSeverity({
    complaintId: req.params.id,
    severity,
    adminId: req.user._id,
    reason,
  });
  return new ApiResponse(200, complaint, 'Severity overridden by admin.').send(res);
});

const nearby = asyncHandler(async (req, res) => {
  const { lat, lng, radiusKm } = req.query;
  if (lat === undefined || lng === undefined) {
    throw ApiError.badRequest('lat and lng query params are required.');
  }
  const complaints = await complaintService.getNearbyComplaints({
    lat: Number(lat),
    lng: Number(lng),
    radiusKm: radiusKm ? Number(radiusKm) : undefined,
  });
  return new ApiResponse(200, complaints, 'Nearby complaints fetched.').send(res);
});

const hotspots = asyncHandler(async (req, res) => {
  const { category, severity } = req.query;
  const data = await complaintService.getHotspots({ category, severity });
  return new ApiResponse(200, data, 'Hotspot data fetched.').send(res);
});

const upvote = asyncHandler(async (req, res) => {
  const complaint = await complaintService.upvoteComplaint({ complaintId: req.params.id, userId: req.user._id });
  return new ApiResponse(200, complaint, 'Upvote toggled.').send(res);
});

module.exports = {
  create,
  getById,
  listMine,
  listAssignedToMe,
  listAll,
  assign,
  updateStatus,
  uploadResolutionEvidence,
  resolve,
  verify,
  comment,
  adminOverrideStatus,
  overrideSeverity,
  nearby,
  hotspots,
  upvote,
};
