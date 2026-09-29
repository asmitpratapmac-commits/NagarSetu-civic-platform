const express = require('express');
const router = express.Router();

const auditLogController = require('../controllers/auditLogController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', protect, authorize('admin'), auditLogController.list);

module.exports = router;
