const mongoose = require('mongoose');

/**
 * User Model
 * Supports three roles: citizen, authority, admin
 * Authority users carry extra fields (department, designation, jurisdiction)
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // never return password by default
    },
    role: {
      type: String,
      enum: ['citizen', 'authority', 'admin'],
      default: 'citizen',
      required: true,
    },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' }, // cloudinary public_id
    },
    address: {
      type: String,
      trim: true,
    },
    // -------- Authority-specific fields --------
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    designation: {
      type: String,
      trim: true,
      default: '',
    },
    employeeId: {
      type: String,
      trim: true,
      default: '',
    },
    jurisdictionArea: {
      type: String,
      trim: true,
      default: '',
    },
    // -------- Account state --------
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    // -------- Citizen stats (denormalized for fast dashboard reads) --------
    stats: {
      totalComplaints: { type: Number, default: 0 },
      resolvedComplaints: { type: Number, default: 0 },
    },
    refreshToken: {
      type: String,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ department: 1 });

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
