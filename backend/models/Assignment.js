const mongoose = require('mongoose');

/**
 * Assignment Model
 * Tracks the full assignment/reassignment history of a complaint —
 * separate from Complaint.assignedTo (which only holds the *current* assignee).
 * Useful for workload analytics and audit trails.
 */
const assignmentSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    reason: {
      type: String,
      enum: ['auto_ai_assignment', 'manual_assignment', 'reassignment', 'escalation'],
      default: 'manual_assignment',
    },
    note: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true, // false once superseded by a reassignment
    },
    unassignedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

assignmentSchema.index({ assignedTo: 1, isActive: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
