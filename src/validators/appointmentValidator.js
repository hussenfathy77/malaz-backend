const { z } = require('zod');

const bookAppointmentSchema = z.object({
  doctor_id: z.string().uuid(),
  schedule_date: z.string().datetime(), // ISO string with date and time
  type: z.enum(['Online', 'Offline']),
});

const updateAppointmentStatusSchema = z.object({
  status: z.enum(['Confirmed', 'Completed', 'Cancelled']),
  meeting_link: z.string().url().optional(), // In case doctor wants to add meeting link when confirming
});

module.exports = {
  bookAppointmentSchema,
  updateAppointmentStatusSchema,
};
