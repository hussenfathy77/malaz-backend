const { z } = require('zod');

const joinCircleSchema = z.object({
  pseudonym: z.string().min(2, 'Pseudonym must be at least 2 characters'),
});

module.exports = {
  joinCircleSchema,
};
