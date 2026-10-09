const { z } = require('zod');

const createClinicalNoteSchema = z.object({
  appointment_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  diagnosis: z.string().optional(),
  treatment_plan: z.string().optional(),
  notes: z.string().optional(),
});

const updateClinicalNoteSchema = z.object({
  diagnosis: z.string().optional(),
  treatment_plan: z.string().optional(),
  notes: z.string().optional(),
});

module.exports = {
  createClinicalNoteSchema,
  updateClinicalNoteSchema,
};
