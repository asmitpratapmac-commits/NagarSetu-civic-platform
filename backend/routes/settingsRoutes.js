const express = require('express');
const router = express.Router();

const settingsController = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', protect, authorize('admin'), settingsController.get);
router.patch('/', protect, authorize('admin'), settingsController.update);

module.exports = router;
