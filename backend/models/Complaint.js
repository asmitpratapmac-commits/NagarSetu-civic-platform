const mongoose = require('mongoose');

const CATEGORY_ENUM = [
  'Pothole',
  'Damaged Road',
  'Garbage / Sanitation',
  'Streetlight',
  'Water Leakage',
  'Water Supply',
  'Drainage',
  'Traffic',
  'Public Property Damage',
  'Other',
];

const SEVERITY_ENUM = ['Critical', 'High', 'Medium', 'Low'];

const STATUS_ENUM = [
  'Submitted',
  'AI Analyzing',
  'Assigned',
  'In Progress',
  'Pending Verification',
  'Resolved',
  'Reopened',
  'Rejected',
];

/**
 * SLA hours by severity — used to compute slaDeadline on creation/severity update.
 * Kept here as the canonical default; Admin can override via SLARule config (see Department/Settings).
 */
const SLA_HOURS = {
  Critical: 24,
  High: 72, // 3 days
  Medium: 168, // 7 days
  Low: 336, // 14 days
};

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    type: { type: String, enum: ['image', 'video'], default: 'image' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const timelineEventSchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUS_ENUM },
    note: { type: String, default: '' },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorRole: { type: String, enum: ['citizen', 'authority', 'admin', 'system', 'ai'] },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorRole: { type: String, enum: ['citizen', 'authority', 'admin'] },
    message: { type: String, required: true, trim: true },
    attachments: [mediaSchema],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const complaintSchema = new mongoose.Schema(
  {
    // -------- Core fields (citizen submitted) --------
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: CATEGORY_ENUM,
      default: 'Other',
    },
    media: [mediaSchema],

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        // [longitude, latitude] — GeoJSON order
        type: [Number],
        required: true,
        index: '2dsphere',
      },
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },

    // -------- Reporter --------
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // -------- AI-derived fields --------
    ai: {
      isAnalyzed: { type: Boolean, default: false },
      predictedCategory: { type: String, default: '' },
      predictedSeverity: { type: String, default: '' },
      predictedDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
      confidence: { type: Number, default: 0 }, // 0-1
      summary: { type: String, default: '' },
      recommendedAction: { type: String, default: '' },
      duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', default: null },
      duplicateCandidates: [
        {
          complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
          similarity: Number,
        },
      ],
      rawResponse: { type: mongoose.Schema.Types.Mixed, default: {} },
      analyzedAt: { type: Date, default: null },
    },

    // -------- Working / authoritative fields (may start as AI suggestion, then be confirmed) --------
    severity: {
      type: String,
      enum: SEVERITY_ENUM,
      default: 'Medium',
    },
    priorityScore: {
      type: Number,
      default: 0, // higher = more urgent, used for sorting officer queues
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },

    // -------- Assignment & status --------
    status: {
      type: String,
      enum: STATUS_ENUM,
      default: 'Submitted',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedAt: { type: Date, default: null },

    // -------- SLA --------
    slaHours: { type: Number, default: SLA_HOURS.Medium },
    slaDeadline: { type: Date, default: null },
    isOverdue: { type: Boolean, default: false },
    escalated: { type: Boolean, default: false },
    escalatedAt: { type: Date, default: null },
    escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // -------- Resolution --------
    resolutionEvidence: [mediaSchema], // before/after evidence uploaded by authority — REQUIRED to resolve
    resolutionNote: { type: String, default: '' },
    resolvedAt: { type: Date, default: null },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // -------- Citizen verification loop --------
    verification: {
      isConfirmedByCitizen: { type: Boolean, default: null }, // null = pending, true/false = confirmed/rejected
      confirmedAt: { type: Date, default: null },
      citizenFeedback: { type: String, default: '' },
      reopenReason: { type: String, default: '' },
      reopenCount: { type: Number, default: 0 },
    },

    // -------- Collaboration --------
    comments: [commentSchema],
    timeline: [timelineEventSchema],

    // -------- Misc --------
    upvoteCount: { type: Number, default: 0 }, // citizens confirming "me too" nearby
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

complaintSchema.index({ location: '2dsphere' });
complaintSchema.index({ status: 1 });
complaintSchema.index({ severity: 1 });
complaintSchema.index({ department: 1 });
complaintSchema.index({ assignedTo: 1 });
complaintSchema.index({ reportedBy: 1 });
complaintSchema.index({ slaDeadline: 1 });
complaintSchema.index({ createdAt: -1 });

// -------- Helper statics --------
complaintSchema.statics.SLA_HOURS = SLA_HOURS;
complaintSchema.statics.CATEGORY_ENUM = CATEGORY_ENUM;
complaintSchema.statics.SEVERITY_ENUM = SEVERITY_ENUM;
complaintSchema.statics.STATUS_ENUM = STATUS_ENUM;

// -------- Pre-save: compute SLA deadline whenever severity changes / on creation --------
complaintSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('severity')) {
    const hours = SLA_HOURS[this.severity] || SLA_HOURS.Medium;
    this.slaHours = hours;
    const base = this.createdAt || new Date();
    this.slaDeadline = new Date(base.getTime() + hours * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
module.exports.CATEGORY_ENUM = CATEGORY_ENUM;
module.exports.SEVERITY_ENUM = SEVERITY_ENUM;
module.exports.STATUS_ENUM = STATUS_ENUM;
module.exports.SLA_HOURS = SLA_HOURS;
