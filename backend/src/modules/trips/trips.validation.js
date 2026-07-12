const { z } = require('zod');

const createTripSchema = z.object({
  vehicleId: z.number().int().positive(),
  driverId: z.number().int().positive(),
  origin: z.string().min(2).max(150),
  destination: z.string().min(2).max(150),
  scheduledAt: z.string().transform((str) => new Date(str)),
  cargoWeight: z.number().positive().optional(),
  notes: z.string().optional()
});

const updateTripSchema = z.object({
  vehicleId: z.number().int().positive().optional(),
  driverId: z.number().int().positive().optional(),
  origin: z.string().min(2).max(150).optional(),
  destination: z.string().min(2).max(150).optional(),
  scheduledAt: z.string().transform((str) => new Date(str)).optional(),
  cargoWeight: z.number().positive().optional(),
  status: z.enum(['Scheduled', 'In_Progress', 'Completed', 'Cancelled']).optional(),
  notes: z.string().optional()
});

const completeTripSchema = z.object({
  distanceKm: z.number().positive(),
  fuelLitres: z.number().positive().optional(),
  fuelPricePerLtr: z.number().positive().optional(),
  expenseCategory: z.enum(['Fuel', 'Maintenance', 'Toll', 'Other']).optional(),
  expenseAmount: z.number().positive().optional(),
  expenseDescription: z.string().optional()
});

module.exports = { createTripSchema, updateTripSchema, completeTripSchema };
