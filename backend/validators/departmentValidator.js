const { z } = require('zod');
const { CATEGORY_ENUM } = require('../models/Complaint');

const createDepartmentSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(20),
  description: z.string().max(500).optional(),
  categories: z.array(z.enum(CATEGORY_ENUM)).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z
    .string()
    .regex(/^[0-9]{10}$/)
    .optional(),
  headOfDepartment: z.string().optional(),
});

const updateDepartmentSchema = createDepartmentSchema.partial();

module.exports = { createDepartmentSchema, updateDepartmentSchema };
