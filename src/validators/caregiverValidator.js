const { z } = require('zod');

const inviteCaregiverSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format')
  })
});

const updateCaregiverStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'REVOKED', 'PENDING'])
  }),
  params: z.object({
    id: z.string().uuid('Invalid Caregiver ID')
  })
});

module.exports = {
  inviteCaregiverSchema,
  updateCaregiverStatusSchema
};
