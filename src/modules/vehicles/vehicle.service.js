// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Vehicle Service (Business Logic)
// ─────────────────────────────────────────────────────────────────────────────

const prisma = require('../../config/database');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');

/**
 * Get all vehicles with optional filtering + pagination
 * @param {Object} query - req.query: type, status, search, page, limit
 */
const getVehicles = async (query) => {
  const { type, status, search } = query;
  const { skip, take, page, limit } = parsePagination(query);

  // Build dynamic where clause
  const where = {
    ...(type   && { type }),
    ...(status && { status }),
    ...(search && {
      regNumber: { contains: search.toUpperCase() },
    }),
  };

  const [vehicles, total] = await prisma.$transaction([
    prisma.vehicle.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.vehicle.count({ where }),
  ]);

  return {
    vehicles,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

/**
 * Get a single vehicle by ID
 */
const getVehicleById = async (id) => {
  return prisma.vehicle.findUnique({ where: { id: Number(id) } });
};

/**
 * Create a new vehicle
 * Prisma will throw P2002 on duplicate regNumber — caught by global error handler → 409
 */
const createVehicle = async (data) => {
  return prisma.vehicle.create({ data });
};

/**
 * Update vehicle fields by ID (partial PATCH)
 */
const updateVehicle = async (id, data) => {
  return prisma.vehicle.update({
    where: { id: Number(id) },
    data,
  });
};

/**
 * Soft-delete: mark vehicle as Retired instead of hard delete
 */
const retireVehicle = async (id) => {
  return prisma.vehicle.update({
    where: { id: Number(id) },
    data: { status: 'Retired' },
  });
};

/**
 * Summary stats for the dashboard cards
 */
const getVehicleStats = async () => {
  const [total, available, onTrip, inShop, retired] = await prisma.$transaction([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: 'Available' } }),
    prisma.vehicle.count({ where: { status: 'On_Trip' } }),
    prisma.vehicle.count({ where: { status: 'In_Shop' } }),
    prisma.vehicle.count({ where: { status: 'Retired' } }),
  ]);
  return { total, available, onTrip, inShop, retired };
};

module.exports = { getVehicles, getVehicleById, createVehicle, updateVehicle, retireVehicle, getVehicleStats };
