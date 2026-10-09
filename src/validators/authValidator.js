const { z } = require('zod');

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['PATIENT', 'DOCTOR', 'CAREGIVER']),
  
  // Patient specific fields
  date_of_birth: z.string().datetime().optional(),
  gender: z.string().optional(),
  emergency_contact: z.string().optional(),

  // Doctor specific fields
  specialization: z.string().optional(),
  session_price: z.number().positive().optional(),
}).superRefine((data, ctx) => {
  if (data.role === 'DOCTOR') {
    if (!data.specialization) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Specialization is required for Doctor', path: ['specialization'] });
    if (data.session_price === undefined) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Session price is required for Doctor', path: ['session_price'] });
  }
  // CAREGIVER: no extra fields required, just a User record
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshSchema
};
