const { z } = require('zod');

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Patient', 'Doctor', 'Caregiver']),
  
  // Patient specific fields
  date_of_birth: z.string().datetime().optional(), // Using ISO string for datetime
  phone: z.string().optional(),

  // Doctor specific fields
  specialization: z.string().optional(),
  session_price: z.number().positive().optional(),

  // Caregiver specific fields
  patient_id: z.string().uuid().optional(),
  relation_type: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === 'Patient') {
    if (!data.date_of_birth) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Date of birth is required for Patient', path: ['date_of_birth'] });
    if (!data.phone) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Phone is required for Patient', path: ['phone'] });
  }
  if (data.role === 'Doctor') {
    if (!data.specialization) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Specialization is required for Doctor', path: ['specialization'] });
    if (data.session_price === undefined) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Session price is required for Doctor', path: ['session_price'] });
  }
  if (data.role === 'Caregiver') {
    if (!data.patient_id) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Patient ID is required for Caregiver', path: ['patient_id'] });
    if (!data.relation_type) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Relation type is required for Caregiver', path: ['relation_type'] });
  }
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

module.exports = {
  registerSchema,
  loginSchema
};
