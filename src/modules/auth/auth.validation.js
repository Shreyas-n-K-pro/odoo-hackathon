// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Auth Validation Schemas (Zod)
// ─────────────────────────────────────────────────────────────────────────────

const { z } = require('zod');
const { ROLES } = require('../../config/constants');

const signupSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100),

  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address')
    .toLowerCase(),

  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),

  role: z.enum(Object.values(ROLES), {
    errorMap: () => ({ message: `Role must be one of: ${Object.values(ROLES).join(', ')}` }),
  }),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address')
    .toLowerCase(),

  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),

  role: z.enum(Object.values(ROLES), {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
});

module.exports = { signupSchema, loginSchema };
