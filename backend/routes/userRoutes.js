const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { updateProfileSchema } = require('../validators/authValidator');

// -------- Self-service --------
router.patch('/me', protect, validate(updateProfileSchema), userController.updateProfile);

// -------- Admin --------
router.get('/', protect, authorize('admin'), userController.list);
router.get('/department/:departmentId', protect, authorize('admin'), userController.listByDepartment);
router.get('/:id', protect, authorize('admin'), userController.getById);
router.patch('/:id/active-status', protect, authorize('admin'), userController.setActiveStatus);
router.patch('/:id/role', protect, authorize('admin'), userController.updateRole);

module.exports = router;
