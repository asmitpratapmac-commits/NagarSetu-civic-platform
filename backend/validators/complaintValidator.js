const { z } = require('zod');
const { CATEGORY_ENUM, SEVERITY_ENUM, STATUS_ENUM } = require('../models/Complaint');

const createComplaintSchema = z.object({
  title: z.string().min(5).max(150),
  description: z.string().min(10).max(2000),
  category: z.enum(CATEGORY_ENUM).optional(),
  address: z.string().max(300).optional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

const updateStatusSchema = z.object({
  status: z.enum(STATUS_ENUM),
  note: z.string().max(1000).optional(),
});

const addCommentSchema = z.object({
  message: z.string().min(1).max(1000),
});

const resolveComplaintSchema = z.object({
  resolutionNote: z.string().min(5).max(1000),
});

const verifyResolutionSchema = z.object({
  isConfirmed: z.boolean(),
  citizenFeedback: z.string().max(1000).optional(),
  reopenReason: z.string().max(1000).optional(),
});

const assignComplaintSchema = z.object({
  assignedTo: z.string().min(1, 'assignedTo user id is required'),
  note: z.string().max(500).optional(),
});

const overrideSeveritySchema = z.object({
  severity: z.enum(SEVERITY_ENUM),
  reason: z.string().min(3).max(500),
});

const complaintQuerySchema = z.object({
  status: z.string().optional(),
  category: z.string().optional(),
  severity: z.string().optional(),
  department: z.string().optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().optional(),
  search: z.string().optional(),
});

module.exports = {
  createComplaintSchema,
  updateStatusSchema,
  addCommentSchema,
  resolveComplaintSchema,
  verifyResolutionSchema,
  assignComplaintSchema,
  overrideSeveritySchema,
  complaintQuerySchema,
};
