const express = require('express');
const router = express.Router();

const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// -------- Admin command center --------
router.get('/admin/summary', protect, authorize('admin'), analyticsController.adminSummary);
router.get('/admin/trend', protect, authorize('admin'), analyticsController.trend);
router.get('/admin/category-distribution', protect, authorize('admin'), analyticsController.categoryDistribution);
router.get('/admin/severity-distribution', protect, authorize('admin'), analyticsController.severityDistribution);
router.get('/admin/department-performance', protect, authorize('admin'), analyticsController.departmentPerformance);
router.get('/admin/ai-stats', protect, authorize('admin'), analyticsController.aiStats);

// -------- Authority dashboard --------
router.get('/authority/summary', protect, authorize('authority'), analyticsController.authoritySummary);

// -------- Citizen dashboard --------
router.get('/citizen/summary', protect, authorize('citizen'), analyticsController.citizenSummary);

module.exports = router;
