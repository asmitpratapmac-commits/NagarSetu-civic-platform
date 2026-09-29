const Notification = require('../models/Notification');
const { SOCKET_EVENTS } = require('../config/constants');

/**
 * Creates a persisted notification and, if an `io` instance is passed,
 * emits it in real-time to the recipient's private room (`user:<id>`).
 */
const create = async ({ recipient, type, title, message, relatedComplaint, relatedAnnouncement, priority, io }) => {
  const notification = await Notification.create({
    recipient,
    type,
    title,
    message,
    relatedComplaint: relatedComplaint || null,
    relatedAnnouncement: relatedAnnouncement || null,
    priority: priority || 'normal',
  });

  if (io) {
    io.to(`user:${recipient}`).emit(SOCKET_EVENTS.NOTIFICATION_NEW, notification);
  }

  return notification;
};

const markAsRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
};

const markAllAsRead = async (userId) => {
  return Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

const listForUser = async (userId, { page = 1, limit = 20, unreadOnly = false } = {}) => {
  const filter = { recipient: userId };
  if (unreadOnly) filter.isRead = false;

  const skip = (page - 1) * limit;
  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: userId, isRead: false }),
  ]);

  return { items, total, unreadCount, page, limit };
};

module.exports = { create, markAsRead, markAllAsRead, listForUser };
