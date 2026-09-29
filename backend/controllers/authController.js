const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/authService');
const auditService = require('../services/auditService');

const register = asyncHandler(async (req, res) => {
  const result = await authService.registerCitizen(req.body);
  return new ApiResponse(201, result, 'Registration successful.').send(res);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return new ApiResponse(200, result, 'Login successful.').send(res);
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshAccessToken(refreshToken);
  return new ApiResponse(200, tokens, 'Token refreshed.').send(res);
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);
  return new ApiResponse(200, null, 'Logged out successfully.').send(res);
});

const getMe = asyncHandler(async (req, res) => {
  return new ApiResponse(200, req.user.toSafeObject(), 'Current user fetched.').send(res);
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user._id, currentPassword, newPassword);
  return new ApiResponse(200, null, 'Password changed successfully. Please log in again.').send(res);
});

/**
 * Admin-only: create authority/admin staff accounts.
 */
const createStaffUser = asyncHandler(async (req, res) => {
  const user = await authService.createStaffUser(req.body);
  await auditService.log({
    actor: req.user._id,
    actorRole: req.user.role,
    action: 'STAFF_USER_CREATED',
    targetType: 'User',
    targetId: user._id,
    afterState: { email: user.email, role: user.role },
    ipAddress: req.ip,
  });
  return new ApiResponse(201, user, 'Staff account created.').send(res);
});

module.exports = { register, login, refresh, logout, getMe, changePassword, createStaffUser };
