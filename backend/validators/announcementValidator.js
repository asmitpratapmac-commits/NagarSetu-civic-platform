const { z } = require('zod');

const createAnnouncementSchema = z.object({
  title: z.string().min(3).max(150),
  message: z.string().min(3).max(1000),
  audience: z.enum(['all', 'citizen', 'authority', 'admin']).optional(),
  severity: z.enum(['info', 'warning', 'critical']).optional(),
  expiresAt: z.string().datetime().optional(),
});

module.exports = { createAnnouncementSchema };
