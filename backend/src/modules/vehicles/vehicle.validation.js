// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Vehicle Validation Schemas (Zod)
// ─────────────────────────────────────────────────────────────────────────────

const { z } = require('zod');

const createVehicleSchema = z.object({
  regNumber: z
    .string({ required_error: 'Registration number is required' })
    .min(3, 'Registration number too short')
    .max(20)
    .toUpperCase(),

  name: z
    .string({ required_error: 'Vehicle name/model is required' })
    .min(2)
    .max(100),

  type: z.enum(['Van', 'Truck', 'Mini'], {
    errorMap: () => ({ message: 'Type must be one of: Van, Truck, Mini' }),
  }),

  capacityKg: z
    .number({ required_error: 'Capacity (kg) is required' })
    .positive('Capacity must be a positive number'),

  odometer: z
    .number()
    .int()
    .nonnegative('Odometer reading cannot be negative')
    .optional()
    .default(0),

  acquisitionCost: z
    .number({ required_error: 'Acquisition cost is required' })
    .positive('Acquisition cost must be a positive number'),

  region: z.string().max(100).optional(),
});

const updateVehicleSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  type: z.enum(['Van', 'Truck', 'Mini']).optional(),
  capacityKg: z.number().positive().optional(),
  odometer: z.number().int().nonnegative().optional(),
  acquisitionCost: z.number().positive().optional(),
  status: z.enum(['Available', 'On_Trip', 'In_Shop', 'Retired']).optional(),
  region: z.string().max(100).optional(),
});

module.exports = { createVehicleSchema, updateVehicleSchema };
