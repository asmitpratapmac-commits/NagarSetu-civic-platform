const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} = require('../validators/authValidator');

// -------- Public --------
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authLimiter, validate(refreshTokenSchema), authController.refresh);

// -------- Authenticated --------
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.post(
  '/change-password',
  protect,
  validate(changePasswordSchema),
  authController.changePassword
);

// -------- Admin only --------
router.post(
  '/staff',
  protect,
  authorize('admin'),
  authController.createStaffUser
);

module.exports = router;
