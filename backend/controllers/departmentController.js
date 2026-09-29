const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const departmentService = require('../services/departmentService');
const auditService = require('../services/auditService');

const create = asyncHandler(async (req, res) => {
  const department = await departmentService.createDepartment(req.body);
  await auditService.log({
    actor: req.user._id,
    actorRole: 'admin',
    action: 'DEPARTMENT_CREATED',
    targetType: 'Department',
    targetId: department._id,
    afterState: req.body,
  });
  return new ApiResponse(201, department, 'Department created.').send(res);
});

const update = asyncHandler(async (req, res) => {
  const department = await departmentService.updateDepartment(req.params.id, req.body);
  await auditService.log({
    actor: req.user._id,
    actorRole: 'admin',
    action: 'DEPARTMENT_UPDATED',
    targetType: 'Department',
    targetId: department._id,
    afterState: req.body,
  });
  return new ApiResponse(200, department, 'Department updated.').send(res);
});

const remove = asyncHandler(async (req, res) => {
  await departmentService.deleteDepartment(req.params.id);
  await auditService.log({
    actor: req.user._id,
    actorRole: 'admin',
    action: 'DEPARTMENT_DELETED',
    targetType: 'Department',
    targetId: req.params.id,
  });
  return new ApiResponse(200, null, 'Department deleted.').send(res);
});

const list = asyncHandler(async (req, res) => {
  const departments = await departmentService.listDepartments();
  return new ApiResponse(200, departments, 'Departments fetched.').send(res);
});

const getById = asyncHandler(async (req, res) => {
  const department = await departmentService.getDepartmentById(req.params.id);
  return new ApiResponse(200, department, 'Department fetched.').send(res);
});

const refreshPerformance = asyncHandler(async (req, res) => {
  const department = await departmentService.refreshDepartmentPerformance(req.params.id);
  return new ApiResponse(200, department, 'Department performance refreshed.').send(res);
});

module.exports = { create, update, remove, list, getById, refreshPerformance };
