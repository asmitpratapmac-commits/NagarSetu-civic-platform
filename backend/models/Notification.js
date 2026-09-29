const mongoose = require('mongoose');

/**
 * Notification Model
 * Delivered in real-time via Socket.IO and persisted for the notification center.
 */
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'complaint_submitted',
        'complaint_assigned',
        'status_changed',
        'complaint_escalated',
        'complaint_resolved',
        'verification_requested',
        'complaint_reopened',
        'new_comment',
        'sla_warning',
        'announcement',
        'system',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    relatedComplaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      default: null,
    },
    relatedAnnouncement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Announcement',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal',
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
