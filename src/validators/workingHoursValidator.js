const { z } = require('zod');

const createWorkingHoursSchema = z.object({
  day_of_week: z.number().min(1).max(7),
  start_time: z.string().datetime(), // expecting ISO string like '1970-01-01T09:00:00.000Z'
  end_time: z.string().datetime(),
  is_online: z.boolean(),
});

module.exports = {
  createWorkingHoursSchema,
};
