const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const analyticsService = require('../services/analyticsService');

const adminSummary = asyncHandler(async (req, res) => {
  const data = await analyticsService.getAdminSummary();
  return new ApiResponse(200, data, 'Admin summary fetched.').send(res);
});

const trend = asyncHandler(async (req, res) => {
  const days = req.query.days ? Number(req.query.days) : 30;
  const data = await analyticsService.getComplaintTrend(days);
  return new ApiResponse(200, data, 'Complaint trend fetched.').send(res);
});

const categoryDistribution = asyncHandler(async (req, res) => {
  const data = await analyticsService.getCategoryDistribution();
  return new ApiResponse(200, data, 'Category distribution fetched.').send(res);
});

const severityDistribution = asyncHandler(async (req, res) => {
  const data = await analyticsService.getSeverityDistribution();
  return new ApiResponse(200, data, 'Severity distribution fetched.').send(res);
});

const departmentPerformance = asyncHandler(async (req, res) => {
  const data = await analyticsService.getDepartmentPerformance();
  return new ApiResponse(200, data, 'Department performance fetched.').send(res);
});

const aiStats = asyncHandler(async (req, res) => {
  const data = await analyticsService.getAiStats();
  return new ApiResponse(200, data, 'AI stats fetched.').send(res);
});

const authoritySummary = asyncHandler(async (req, res) => {
  const data = await analyticsService.getAuthoritySummary(req.user._id);
  return new ApiResponse(200, data, 'Authority summary fetched.').send(res);
});

const citizenSummary = asyncHandler(async (req, res) => {
  const data = await analyticsService.getCitizenSummary(req.user._id);
  return new ApiResponse(200, data, 'Citizen summary fetched.').send(res);
});

module.exports = {
  adminSummary,
  trend,
  categoryDistribution,
  severityDistribution,
  departmentPerformance,
  aiStats,
  authoritySummary,
  citizenSummary,
};
