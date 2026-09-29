const mongoose = require('mongoose');

/**
 * Settings Model
 * Singleton document (only one row should ever exist — enforced in service layer)
 * holding SLA rules, AI configuration and general app settings, all editable by Admin.
 */
const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'app_settings',
      unique: true,
    },
    slaRules: {
      Critical: { type: Number, default: 24 }, // hours
      High: { type: Number, default: 72 },
      Medium: { type: Number, default: 168 },
      Low: { type: Number, default: 336 },
    },
    aiConfig: {
      enabled: { type: Boolean, default: true },
      autoAssignDepartment: { type: Boolean, default: true },
      autoSetSeverity: { type: Boolean, default: true },
      duplicateDetectionThreshold: { type: Number, default: 0.8 }, // 0-1 similarity
      imageDetectionEnabled: { type: Boolean, default: true },
      aiServiceUrl: { type: String, default: 'http://localhost:8000' },
      confidenceThresholdForAutoAssign: { type: Number, default: 0.6 },
    },
    general: {
      appName: { type: String, default: 'NagarSetu AI' },
      supportEmail: { type: String, default: 'support@nagarsetu.ai' },
      maintenanceMode: { type: Boolean, default: false },
      defaultMapCenter: {
        lat: { type: Number, default: 28.6139 }, // New Delhi fallback
        lng: { type: Number, default: 77.209 },
      },
      allowCitizenReopen: { type: Boolean, default: true },
      maxReopenCount: { type: Number, default: 2 },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
