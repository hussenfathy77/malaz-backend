const { z } = require('zod');

const joinCircleSchema = z.object({
  pseudonym: z.string().min(2, 'Pseudonym must be at least 2 characters').optional(),
});

const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty')
});

const createCircleSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
});

const addPatientSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
});

module.exports = {
  joinCircleSchema,
  sendMessageSchema,
  createCircleSchema,
  addPatientSchema
};
