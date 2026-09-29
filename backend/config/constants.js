module.exports = {
  ROLES: {
    CITIZEN: 'citizen',
    AUTHORITY: 'authority',
    ADMIN: 'admin',
  },
  COMPLAINT_STATUS: {
    SUBMITTED: 'Submitted',
    AI_ANALYZING: 'AI Analyzing',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    PENDING_VERIFICATION: 'Pending Verification',
    RESOLVED: 'Resolved',
    REOPENED: 'Reopened',
    REJECTED: 'Rejected',
  },
  SEVERITY: {
    CRITICAL: 'Critical',
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low',
  },
  // Valid forward transitions for complaint status — used to reject illegal jumps
  // (e.g. can't go straight from "Submitted" to "Resolved").
  STATUS_TRANSITIONS: {
    Submitted: ['AI Analyzing', 'Assigned', 'Rejected'],
    'AI Analyzing': ['Assigned', 'Rejected'],
    Assigned: ['In Progress', 'Rejected'],
    'In Progress': ['Pending Verification', 'Rejected'],
    'Pending Verification': ['Resolved', 'Reopened'],
    Resolved: ['Reopened'],
    Reopened: ['Assigned', 'In Progress'],
    Rejected: [],
  },
  SOCKET_EVENTS: {
    COMPLAINT_CREATED: 'complaint:created',
    COMPLAINT_ASSIGNED: 'complaint:assigned',
    COMPLAINT_STATUS_CHANGED: 'complaint:status_changed',
    COMPLAINT_ESCALATED: 'complaint:escalated',
    COMPLAINT_RESOLVED: 'complaint:resolved',
    NEW_COMMENT: 'complaint:new_comment',
    NOTIFICATION_NEW: 'notification:new',
    ANNOUNCEMENT_NEW: 'announcement:new',
  },
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
};
