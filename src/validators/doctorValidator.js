const { z } = require('zod');

const getDoctorsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  specialization: z.string().optional(),
  min_price: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  max_price: z.string().regex(/^\d+(\.\d+)?$/).optional(),
});

const updateDoctorSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  specialization: z.string().optional(),
  session_price: z.number().positive().optional(),
});

module.exports = {
  getDoctorsQuerySchema,
  updateDoctorSchema,
};
