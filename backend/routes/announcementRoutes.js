const express = require('express');
const router = express.Router();

const announcementController = require('../controllers/announcementController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { createAnnouncementSchema } = require('../validators/announcementValidator');

router.get('/', protect, announcementController.list);
router.post('/', protect, authorize('admin'), validate(createAnnouncementSchema), announcementController.create);
router.patch('/:id/deactivate', protect, authorize('admin'), announcementController.deactivate);

module.exports = router;
