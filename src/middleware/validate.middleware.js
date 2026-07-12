// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Zod Validation Middleware
// Validates req.body against a Zod schema.
// Returns structured 422 errors instead of raw crashes.
// ─────────────────────────────────────────────────────────────────────────────

const { ZodError } = require('zod');
const { sendError } = require('../utils/apiResponse');

/**
 * validate(schema) — wraps a Zod schema into Express middleware
 * @param {ZodSchema} schema
 * @returns Express middleware
 *
 * Usage:
 *   router.post('/', validate(loginSchema), controller.login)
 */
const validate = (schema) => (req, res, next) => {
  try {
    // Parse and replace req.body with the validated + typed data
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const details = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return sendError(res, 'Validation failed. Check the details field.', 422, 'VALIDATION_ERROR', details);
    }
    next(err);
  }
};

module.exports = { validate };
