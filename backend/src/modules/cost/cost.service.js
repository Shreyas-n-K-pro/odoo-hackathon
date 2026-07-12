// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Cost Service (Business Logic)
// ─────────────────────────────────────────────────────────────────────────────

const prisma = require('../../config/database');

/**
 * Get fleet-wide operational cost total (Fuel + Maintenance)
 */
const getFleetTotalCost = async () => {
  const [fuelAggregate, maintenanceAggregate] = await Promise.all([
    prisma.fuelLog.aggregate({
      _sum: { totalCost: true },
    }),
    prisma.maintenanceLog.aggregate({
      _sum: { cost: true },
    }),
  ]);

  const fuelTotal        = Number(fuelAggregate._sum.totalCost || 0);
  const maintenanceTotal = Number(maintenanceAggregate._sum.cost || 0);

  return {
    fuelTotal,
    maintenanceTotal,
    total: fuelTotal + maintenanceTotal,
  };
};

/**
 * Get operational cost for a specific vehicle by ID
 */
const getVehicleOperationalCost = async (vehicleId) => {
  const id = Number(vehicleId);

  const [fuelAggregate, maintenanceAggregate] = await Promise.all([
    prisma.fuelLog.aggregate({
      where: { vehicleId: id },
      _sum: { totalCost: true },
    }),
    prisma.maintenanceLog.aggregate({
      where: { vehicleId: id },
      _sum: { cost: true },
    }),
  ]);

  const fuelTotal        = Number(fuelAggregate._sum.totalCost || 0);
  const maintenanceTotal = Number(maintenanceAggregate._sum.cost || 0);

  return {
    fuelTotal,
    maintenanceTotal,
    operationalCost: fuelTotal + maintenanceTotal,
  };
};

module.exports = {
  getFleetTotalCost,
  getVehicleOperationalCost,
};
