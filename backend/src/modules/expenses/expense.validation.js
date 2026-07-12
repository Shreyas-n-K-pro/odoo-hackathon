// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Expense Validation Schemas (Zod)
// ─────────────────────────────────────────────────────────────────────────────

const { z } = require('zod');

const createExpenseSchema = z.object({
  vehicleId: z
    .number({ required_error: 'Vehicle ID is required' })
    .int()
    .positive('Vehicle ID must be a positive integer'),

  tripId: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),

  toll: z
    .number()
    .nonnegative()
    .optional()
    .default(0),

  other: z
    .number()
    .nonnegative()
    .optional()
    .default(0),

  maintenanceLinked: z
    .number()
    .nonnegative()
    .optional()
    .default(0),

  description: z.string().max(255).optional(),

  expenseDate: z
    .string({ required_error: 'Expense date is required' })
    .transform((val) => new Date(val)),
});

module.exports = { createExpenseSchema };
