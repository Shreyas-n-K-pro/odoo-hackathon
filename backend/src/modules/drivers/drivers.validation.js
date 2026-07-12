const { z } = require('zod');

const createDriverSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).min(2).max(100),
  licenseNumber: z.string({ required_error: 'License number is required' }).min(3).max(50),
  licenseExpiry: z.string().transform((str) => new Date(str)),
  phone: z.string({ required_error: 'Phone number is required' }).min(5).max(20),
  status: z.enum(['Active', 'On_Leave', 'Inactive', 'Available', 'On_Trip', 'Off_Duty', 'Suspended']).optional().default('Active'),
  region: z.string().max(100).optional(),
  safetyScore: z.number().int().min(0).max(100).optional().default(100),
});

const updateDriverSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  licenseNumber: z.string().min(3).max(50).optional(),
  licenseExpiry: z.string().transform((str) => new Date(str)).optional(),
  phone: z.string().min(5).max(20).optional(),
  status: z.enum(['Active', 'On_Leave', 'Inactive', 'Available', 'On_Trip', 'Off_Duty', 'Suspended']).optional(),
  region: z.string().max(100).optional(),
  safetyScore: z.number().int().min(0).max(100).optional(),
});

module.exports = { createDriverSchema, updateDriverSchema };
