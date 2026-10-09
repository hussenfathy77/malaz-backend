const { z } = require('zod');

const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED'])
});

module.exports = {
  updateUserStatusSchema
};
