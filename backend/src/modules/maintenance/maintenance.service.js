// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Maintenance Service (Business Logic)
// ─────────────────────────────────────────────────────────────────────────────

const prisma = require('../../config/database');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');

/**
 * Get all maintenance logs with optional vehicle filter + pagination
 */
const getMaintenanceLogs = async (query) => {
  const { vehicleId } = query;
  const { skip, take, page, limit } = parsePagination(query);

  const where = {
    ...(vehicleId && { vehicleId: Number(vehicleId) }),
  };

  const [logs, total] = await prisma.$transaction([
    prisma.maintenanceLog.findMany({
      where,
      skip,
      take,
      orderBy: { servicedAt: 'desc' },
      include: { vehicle: true },
    }),
    prisma.maintenanceLog.count({ where }),
  ]);

  return {
    logs,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

/**
 * Create a new active maintenance log and set vehicle to 'In_Shop'
 */
const createMaintenanceLog = async (data) => {
  return prisma.$transaction(async (tx) => {
    // 1. Verify vehicle exists and is not retired
    const vehicle = await tx.vehicle.findUnique({
      where: { id: data.vehicleId },
    });

    if (!vehicle) {
      const err = new Error('Vehicle not found.');
      err.status = 404;
      throw err;
    }

    if (vehicle.status === 'Retired') {
      const err = new Error('Cannot schedule maintenance on a retired vehicle.');
      err.status = 400;
      throw err;
    }

    // 2. Insert maintenance log (default status: Active)
    const log = await tx.maintenanceLog.create({
      data: {
        vehicleId:     data.vehicleId,
        type:          data.type,
        description:   data.description,
        cost:          data.cost,
        status:        'Active',
        servicedAt:    data.servicedAt,
        nextServiceAt: data.nextServiceAt || null,
        odometer:      data.odometer,
        vendor:        data.vendor || null,
      },
      include: { vehicle: true },
    });

    // 3. Update vehicle status to 'In_Shop'
    await tx.vehicle.update({
      where: { id: data.vehicleId },
      data: { status: 'In_Shop' },
    });

    return log;
  });
};

/**
 * Close maintenance log and restore vehicle status to 'Available' (unless Retired)
 */
const closeMaintenanceLog = async (id) => {
  return prisma.$transaction(async (tx) => {
    // 1. Find the maintenance log
    const log = await tx.maintenanceLog.findUnique({
      where: { id: Number(id) },
      include: { vehicle: true },
    });

    if (!log) {
      const err = new Error('Maintenance log not found.');
      err.status = 404;
      throw err;
    }

    if (log.status === 'Completed') {
      return log;
    }

    // 2. Set maintenance log status to Completed
    const updatedLog = await tx.maintenanceLog.update({
      where: { id: Number(id) },
      data: { status: 'Completed' },
      include: { vehicle: true },
    });

    // 3. Restore vehicle status to Available (unless Retired)
    if (log.vehicle && log.vehicle.status !== 'Retired') {
      await tx.vehicle.update({
        where: { id: log.vehicleId },
        data: { status: 'Available' },
      });
    }

    return updatedLog;
  });
};

module.exports = {
  getMaintenanceLogs,
  createMaintenanceLog,
  closeMaintenanceLog,
};
