const { z } = require('zod');

const bookAppointmentSchema = z.object({
  doctor_id: z.string().uuid(),
  date: z.string().datetime(),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
});

const updateAppointmentStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  meeting_link: z.string().url().optional(),
});

module.exports = {
  bookAppointmentSchema,
  updateAppointmentStatusSchema,
};
