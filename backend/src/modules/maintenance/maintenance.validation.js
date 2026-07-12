// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Maintenance Validation Schemas (Zod)
// ─────────────────────────────────────────────────────────────────────────────

const { z } = require('zod');

const createMaintenanceSchema = z.object({
  vehicleId: z
    .number({ required_error: 'Vehicle ID is required' })
    .int()
    .positive('Vehicle ID must be a positive integer'),

  type: z.enum(['Routine', 'Repair', 'Inspection'], {
    errorMap: () => ({ message: 'Type must be one of: Routine, Repair, Inspection' }),
  }),

  description: z
    .string({ required_error: 'Description is required' })
    .min(3, 'Description too short')
    .max(1000),

  cost: z
    .number({ required_error: 'Cost is required' })
    .positive('Cost must be a positive number'),

  servicedAt: z
    .string({ required_error: 'Service date is required' })
    .transform((val) => new Date(val)),

  nextServiceAt: z
    .string()
    .transform((val) => new Date(val))
    .optional(),

  odometer: z
    .number({ required_error: 'Odometer reading is required' })
    .int()
    .nonnegative('Odometer reading cannot be negative'),

  vendor: z.string().max(150).optional(),
});

module.exports = { createMaintenanceSchema };
