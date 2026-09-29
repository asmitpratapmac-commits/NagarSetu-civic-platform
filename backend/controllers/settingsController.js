const Settings = require('../models/Settings');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const auditService = require('../services/auditService');

const getOrCreateSettings = async () => {
  let settings = await Settings.findOne({ key: 'app_settings' });
  if (!settings) {
    settings = await Settings.create({ key: 'app_settings' });
  }
  return settings;
};

const get = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  return new ApiResponse(200, settings, 'Settings fetched.').send(res);
});

const update = asyncHandler(async (req, res) => {
  const before = (await getOrCreateSettings()).toObject();
  const { slaRules, aiConfig, general } = req.body;

  const update = { updatedBy: req.user._id };
  if (slaRules) update.slaRules = slaRules;
  if (aiConfig) update.aiConfig = aiConfig;
  if (general) update.general = general;

  const settings = await Settings.findOneAndUpdate({ key: 'app_settings' }, update, {
    new: true,
    upsert: true,
    runValidators: true,
  });

  await auditService.log({
    actor: req.user._id,
    actorRole: 'admin',
    action: 'SETTINGS_UPDATED',
    targetType: 'Settings',
    targetId: settings._id,
    beforeState: { slaRules: before.slaRules, aiConfig: before.aiConfig, general: before.general },
    afterState: { slaRules: settings.slaRules, aiConfig: settings.aiConfig, general: settings.general },
  });

  return new ApiResponse(200, settings, 'Settings updated.').send(res);
});

module.exports = { get, update };
