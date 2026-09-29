const express = require('express');
const router = express.Router();

const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/detect-image', protect, upload.single('image'), aiController.detectImage);
router.get('/health', protect, aiController.healthCheck);

module.exports = router;
