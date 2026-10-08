const { z } = require('zod');

const createMedicalRecordSchema = z.object({
  patient_id: z.string().uuid('Invalid Patient ID'),
  doctor_notes: z.string().min(1, 'Doctor notes are required'),
  prescription_pdf_url: z.string().url('Invalid PDF URL').optional(),
});

const updateMedicalRecordSchema = z.object({
  doctor_notes: z.string().min(1, 'Doctor notes are required').optional(),
  prescription_pdf_url: z.string().url('Invalid PDF URL').optional(),
});

module.exports = {
  createMedicalRecordSchema,
  updateMedicalRecordSchema,
};
