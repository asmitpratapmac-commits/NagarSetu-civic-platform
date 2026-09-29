const Announcement = require('../models/Announcement');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const notificationService = require('../services/notificationService');
const { SOCKET_EVENTS } = require('../config/constants');
const User = require('../models/User');

const create = asyncHandler(async (req, res) => {
  const { title, message, audience, severity, expiresAt } = req.body;
  const announcement = await Announcement.create({
    title,
    message,
    audience: audience || 'all',
    severity: severity || 'info',
    expiresAt: expiresAt || null,
    createdBy: req.user._id,
  });

  // Broadcast in real-time to the target audience room, and persist a notification per user.
  const targetFilter = audience && audience !== 'all' ? { role: audience, isActive: true } : { isActive: true };
  const recipients = await User.find(targetFilter).select('_id');

  if (req.io) {
    const room = audience && audience !== 'all' ? `role:${audience}` : 'all-users';
    req.io.to(room).emit(SOCKET_EVENTS.ANNOUNCEMENT_NEW, announcement);
  }

  await Promise.all(
    recipients.map((u) =>
      notificationService.create({
        recipient: u._id,
        type: 'announcement',
        title: announcement.title,
        message: announcement.message,
        relatedAnnouncement: announcement._id,
        priority: severity === 'critical' ? 'high' : 'normal',
        io: req.io,
      })
    )
  );

  return new ApiResponse(201, announcement, 'Announcement published.').send(res);
});

const list = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.user.role !== 'admin') {
    filter.audience = { $in: ['all', req.user.role] };
  }
  const announcements = await Announcement.find(filter).sort({ createdAt: -1 }).limit(50);
  return new ApiResponse(200, announcements, 'Announcements fetched.').send(res);
});

const deactivate = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!announcement) throw ApiError.notFound('Announcement not found.');
  return new ApiResponse(200, announcement, 'Announcement deactivated.').send(res);
});

module.exports = { create, list, deactivate };
