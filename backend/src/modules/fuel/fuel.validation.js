// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Fuel Validation Schemas (Zod)
// ─────────────────────────────────────────────────────────────────────────────

const { z } = require('zod');

const createFuelLogSchema = z.object({
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

  liters: z
    .number({ required_error: 'Liters is required' })
    .positive('Liters must be a positive number'),

  cost: z
    .number({ required_error: 'Cost is required' })
    .positive('Cost must be a positive number'),

  odometer: z
    .number()
    .int()
    .nonnegative()
    .optional(),

  station: z.string().max(150).optional(),

  logDate: z
    .string({ required_error: 'Log date is required' })
    .transform((val) => new Date(val)),
});

module.exports = { createFuelLogSchema };
