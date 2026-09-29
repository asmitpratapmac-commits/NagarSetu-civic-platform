const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const notificationService = require('../services/notificationService');

const list = asyncHandler(async (req, res) => {
  const { page, limit, unreadOnly } = req.query;
  const result = await notificationService.listForUser(req.user._id, {
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
    unreadOnly: unreadOnly === 'true',
  });
  return new ApiResponse(200, result.items, 'Notifications fetched.', {
    total: result.total,
    unreadCount: result.unreadCount,
    page: result.page,
    limit: result.limit,
  }).send(res);
});

const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  return new ApiResponse(200, notification, 'Notification marked as read.').send(res);
});

const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  return new ApiResponse(200, null, 'All notifications marked as read.').send(res);
});

module.exports = { list, markRead, markAllRead };
