const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

/**
 * Writes an audit log entry. Never throws — audit logging failures should not
 * break the primary operation, but they are logged locally for investigation.
 */
const log = async ({ actor, actorRole, action, targetType, targetId, beforeState, afterState, reason, ipAddress }) => {
  try {
    await AuditLog.create({
      actor,
      actorRole,
      action,
      targetType,
      targetId,
      beforeState: beforeState || {},
      afterState: afterState || {},
      reason: reason || '',
      ipAddress: ipAddress || '',
    });
  } catch (err) {
    logger.error(`Failed to write audit log for action ${action}: ${err.message}`);
  }
};

module.exports = { log };
