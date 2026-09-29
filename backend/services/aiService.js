const axios = require('axios');
const logger = require('../utils/logger');
const Settings = require('../models/Settings');

const getAiBaseUrl = async () => {
  const settings = await Settings.findOne({ key: 'app_settings' });
  return (settings && settings.aiConfig && settings.aiConfig.aiServiceUrl) || process.env.AI_SERVICE_URL || 'http://localhost:8000';
};

const client = axios.create({ timeout: 8000 });

/**
 * Sends a complaint's text (+ optional image URL) to the AI service for
 * classification/severity/department/duplicate prediction.
 * Never throws to the caller — on failure it returns a safe default so the
 * complaint flow (SLA calc, assignment) can proceed without the AI service.
 */
const predictComplaint = async ({ title, description, category, imageUrl, existingComplaints }) => {
  try {
    const baseUrl = await getAiBaseUrl();
    const { data } = await client.post(`${baseUrl}/predict-complaint`, {
      title,
      description,
      category,
      image_url: imageUrl || null,
      existing_complaints: existingComplaints || [],
    });
    return { success: true, ...data };
  } catch (err) {
    logger.warn(`AI service predict-complaint failed, using fallback: ${err.message}`);
    return {
      success: false,
      category: category || 'Other',
      severity: 'Medium',
      confidence: 0,
      summary: description ? description.slice(0, 140) : '',
      recommendedAction: 'Manual review required — AI service unavailable.',
      duplicateCandidates: [],
    };
  }
};

const detectImage = async ({ imageUrl }) => {
  try {
    const baseUrl = await getAiBaseUrl();
    const { data } = await client.post(`${baseUrl}/detect-image`, { image_url: imageUrl });
    return { success: true, ...data };
  } catch (err) {
    logger.warn(`AI service detect-image failed, using fallback: ${err.message}`);
    return {
      success: false,
      detectedIssue: 'unknown',
      confidence: 0,
      category: 'Other',
      severity: 'Medium',
      recommendedAction: 'Manual review required — AI service unavailable.',
    };
  }
};

const detectDuplicate = async ({ complaintId, title, description, latitude, longitude }) => {
  try {
    const baseUrl = await getAiBaseUrl();
    const { data } = await client.post(`${baseUrl}/detect-duplicate`, {
      complaint_id: complaintId,
      title,
      description,
      latitude,
      longitude,
    });
    return { success: true, ...data };
  } catch (err) {
    logger.warn(`AI service detect-duplicate failed, using fallback: ${err.message}`);
    return { success: false, duplicates: [] };
  }
};

const summarize = async ({ text }) => {
  try {
    const baseUrl = await getAiBaseUrl();
    const { data } = await client.post(`${baseUrl}/summarize`, { text });
    return { success: true, ...data };
  } catch (err) {
    logger.warn(`AI service summarize failed, using fallback: ${err.message}`);
    return { success: false, summary: text ? text.slice(0, 140) : '' };
  }
};

const checkHealth = async () => {
  try {
    const baseUrl = await getAiBaseUrl();
    const { data } = await client.get(`${baseUrl}/health`);
    return { online: true, ...data };
  } catch (err) {
    return { online: false, error: err.message };
  }
};

module.exports = { predictComplaint, detectImage, detectDuplicate, summarize, checkHealth };
