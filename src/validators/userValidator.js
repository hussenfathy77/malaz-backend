const { z } = require('zod');

const updateProfileSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

const changePasswordSchema = z.object({
  old_password: z.string().min(1, "Old password is required"),
  new_password: z.string().min(6, "New password must be at least 6 characters"),
});

module.exports = {
  updateProfileSchema,
  changePasswordSchema
};
