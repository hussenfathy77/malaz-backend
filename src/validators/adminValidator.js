const { z } = require('zod');

const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'SUSPENDED'])
  }),
  params: z.object({
    id: z.string().uuid('Invalid User ID')
  })
});

module.exports = {
  updateUserStatusSchema
};
