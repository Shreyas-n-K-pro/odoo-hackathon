// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Fuel Service (Business Logic)
// ─────────────────────────────────────────────────────────────────────────────

const prisma = require('../../config/database');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');

/**
 * Get all fuel logs with optional vehicle filter + pagination
 */
const getFuelLogs = async (query) => {
  const { vehicleId, search, sortBy, sortOrder } = query;
  const { skip, take, page, limit } = parsePagination(query);

  const where = {
    ...(vehicleId && { vehicleId: Number(vehicleId) }),
    ...(search && {
      vehicle: {
        OR: [
          { regNumber: { contains: search } },
          { name: { contains: search } }
        ]
      }
    })
  };

  const order = {};
  if (sortBy) {
    order[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
  } else {
    order['filledAt'] = 'desc';
  }

  const [logs, total] = await prisma.$transaction([
    prisma.fuelLog.findMany({
      where,
      skip,
      take,
      orderBy: order,
      include: { vehicle: true, trip: true },
    }),
    prisma.fuelLog.count({ where }),
  ]);

  return {
    logs,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

/**
 * Create a new fuel log
 */
const createFuelLog = async (data) => {
  // 1. Verify vehicle exists
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: data.vehicleId },
  });

  if (!vehicle) {
    const err = new Error('Vehicle not found.');
    err.status = 404;
    throw err;
  }

  // 2. Resolve odometer default
  const odometerVal = data.odometer !== undefined ? data.odometer : vehicle.odometer;

  // 3. Calculate price per liter
  const pricePerLtr = data.cost / data.liters;

  // 4. Create the fuel log in a transaction
  return prisma.$transaction(async (tx) => {
    const log = await tx.fuelLog.create({
      data: {
        vehicleId:     data.vehicleId,
        tripId:        data.tripId || null,
        litres:        data.liters,
        pricePerLtr:   pricePerLtr,
        totalCost:     data.cost,
        odometer:      odometerVal,
        station:       data.station || null,
        filledAt:      data.logDate,
      },
      include: { vehicle: true, trip: true },
    });

    // 5. If logged odometer is higher than current, update vehicle odometer
    if (odometerVal > vehicle.odometer) {
      await tx.vehicle.update({
        where: { id: data.vehicleId },
        data: { odometer: odometerVal },
      });
    }

    return log;
  });
};

module.exports = {
  getFuelLogs,
  createFuelLog,
};
