const mongoose = require('mongoose');

/**
 * Department Model
 * Represents a civic department (e.g. Roads, Sanitation, Water Board)
 * Each complaint category maps to a responsible department for auto-assignment.
 */
const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true, // e.g. "ROADS", "SANITATION", "WATER"
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    categories: [
      {
        type: String,
        enum: [
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
        ],
      },
    ],
    headOfDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Denormalized performance snapshot, refreshed by an analytics job
    performance: {
      totalAssigned: { type: Number, default: 0 },
      totalResolved: { type: Number, default: 0 },
      avgResolutionHours: { type: Number, default: 0 },
      overdueCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', departmentSchema);
