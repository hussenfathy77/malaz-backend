const { z } = require('zod');

const inviteCaregiverSchema = z.object({
  email: z.string().email('Invalid email format')
});

const updateCaregiverStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'REVOKED', 'PENDING'])
});

module.exports = {
  inviteCaregiverSchema,
  updateCaregiverStatusSchema
};
