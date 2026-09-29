const mongoose = require('mongoose');

/**
 * AuditLog Model
 * Immutable record of sensitive actions: status overrides, user management,
 * SLA config changes, department changes, escalations, etc.
 */
const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actorRole: {
      type: String,
      enum: ['citizen', 'authority', 'admin', 'system'],
      required: true,
    },
    action: {
      type: String,
      required: true,
      // e.g. "COMPLAINT_STATUS_OVERRIDE", "USER_DEACTIVATED", "DEPARTMENT_CREATED",
      // "SLA_RULE_UPDATED", "COMPLAINT_REASSIGNED", "USER_ROLE_CHANGED"
    },
    targetType: {
      type: String,
      enum: ['Complaint', 'User', 'Department', 'Announcement', 'Settings', 'AIConfig'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    beforeState: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    afterState: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    reason: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
