const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const aiService = require('../services/aiService');

/**
 * Standalone "AI Image Detection" demo/tool — citizen or authority uploads an image
 * and immediately gets back the AI's read on it, without creating a complaint.
 * Useful both as a showcase feature and as a pre-check before filing a report.
 */
const detectImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('An image file is required.');
  }
  const imageUrl = req.file.path;
  const result = await aiService.detectImage({ imageUrl });
  return new ApiResponse(200, { imageUrl, ...result }, 'Image analyzed.').send(res);
});

const healthCheck = asyncHandler(async (req, res) => {
  const health = await aiService.checkHealth();
  return new ApiResponse(200, health, 'AI service health checked.').send(res);
});

module.exports = { detectImage, healthCheck };
