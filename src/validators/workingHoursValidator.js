const { z } = require('zod');

const createWorkingHoursSchema = z.object({
  day_of_week: z.string().min(3),
  start_time: z.string().min(1),
  end_time: z.string().min(1),
});

module.exports = {
  createWorkingHoursSchema,
};
