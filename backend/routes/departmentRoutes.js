const express = require('express');
const router = express.Router();

const departmentController = require('../controllers/departmentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { createDepartmentSchema, updateDepartmentSchema } = require('../validators/departmentValidator');

// Readable by any authenticated user (e.g. citizen complaint form category → department info)
router.get('/', protect, departmentController.list);
router.get('/:id', protect, departmentController.getById);

// Admin only
router.post('/', protect, authorize('admin'), validate(createDepartmentSchema), departmentController.create);
router.patch('/:id', protect, authorize('admin'), validate(updateDepartmentSchema), departmentController.update);
router.delete('/:id', protect, authorize('admin'), departmentController.remove);
router.post('/:id/refresh-performance', protect, authorize('admin'), departmentController.refreshPerformance);

module.exports = router;
