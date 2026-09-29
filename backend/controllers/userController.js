const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const userService = require('../services/userService');
const auditService = require('../services/auditService');

const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateOwnProfile(req.user._id, req.body);
  return new ApiResponse(200, user.toSafeObject(), 'Profile updated.').send(res);
});

const list = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  return new ApiResponse(200, result.items, 'Users fetched.', {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  }).send(res);
});

const getById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return new ApiResponse(200, user, 'User fetched.').send(res);
});

const setActiveStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await userService.setActiveStatus(req.params.id, isActive);
  await auditService.log({
    actor: req.user._id,
    actorRole: 'admin',
    action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
    targetType: 'User',
    targetId: user._id,
    afterState: { isActive },
  });
  return new ApiResponse(200, user, `User ${isActive ? 'activated' : 'deactivated'}.`).send(res);
});

const updateRole = asyncHandler(async (req, res) => {
  const { role, department } = req.body;
  const user = await userService.updateUserRole(req.params.id, role, department);
  await auditService.log({
    actor: req.user._id,
    actorRole: 'admin',
    action: 'USER_ROLE_CHANGED',
    targetType: 'User',
    targetId: user._id,
    afterState: { role, department },
  });
  return new ApiResponse(200, user, 'User role updated.').send(res);
});

const listByDepartment = asyncHandler(async (req, res) => {
  const officers = await userService.listAuthorityByDepartment(req.params.departmentId);
  return new ApiResponse(200, officers, 'Officers fetched.').send(res);
});

module.exports = { updateProfile, list, getById, setActiveStatus, updateRole, listByDepartment };
