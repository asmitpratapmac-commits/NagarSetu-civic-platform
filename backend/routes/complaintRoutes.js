const express = require('express');
const router = express.Router();

const complaintController = require('../controllers/complaintController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { complaintCreationLimiter } = require('../middleware/rateLimiter');
const {
  createComplaintSchema,
  updateStatusSchema,
  addCommentSchema,
  resolveComplaintSchema,
  verifyResolutionSchema,
  assignComplaintSchema,
  overrideSeveritySchema,
  complaintQuerySchema,
} = require('../validators/complaintValidator');

// -------- Public / semi-public --------
router.get('/nearby', complaintController.nearby);
router.get('/hotspots', complaintController.hotspots);

// -------- Citizen --------
router.post(
  '/',
  protect,
  authorize('citizen'),
  complaintCreationLimiter,
  upload.array('media', 5),
  validate(createComplaintSchema),
  complaintController.create
);
router.get('/mine', protect, authorize('citizen'), validate(complaintQuerySchema, 'query'), complaintController.listMine);
router.post('/:id/verify', protect, authorize('citizen'), validate(verifyResolutionSchema), complaintController.verify);
router.post('/:id/upvote', protect, authorize('citizen'), complaintController.upvote);

// -------- Authority --------
router.get(
  '/assigned/me',
  protect,
  authorize('authority'),
  validate(complaintQuerySchema, 'query'),
  complaintController.listAssignedToMe
);
router.post(
  '/:id/resolution-evidence',
  protect,
  authorize('authority'),
  upload.array('media', 5),
  complaintController.uploadResolutionEvidence
);
router.post('/:id/resolve', protect, authorize('authority'), validate(resolveComplaintSchema), complaintController.resolve);

// -------- Shared: citizen (own), authority (assigned), admin (any) --------
router.get('/:id', protect, complaintController.getById);
router.post('/:id/comments', protect, validate(addCommentSchema), complaintController.comment);
router.patch(
  '/:id/status',
  protect,
  authorize('authority', 'admin'),
  validate(updateStatusSchema),
  complaintController.updateStatus
);

// -------- Admin --------
router.get('/', protect, authorize('admin'), validate(complaintQuerySchema, 'query'), complaintController.listAll);
router.post('/:id/assign', protect, authorize('admin'), validate(assignComplaintSchema), complaintController.assign);
router.patch('/:id/override-status', protect, authorize('admin'), complaintController.adminOverrideStatus);
router.patch(
  '/:id/override-severity',
  protect,
  authorize('admin'),
  validate(overrideSeveritySchema),
  complaintController.overrideSeverity
);

module.exports = router;
