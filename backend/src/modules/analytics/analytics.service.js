const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// We use ₹100 per km as the flat revenue rate to compute ROI/revenue consistently.
const REVENUE_RATE_PER_KM = 100;

const getSummary = async () => {
  const [
    totalVehicles,
    totalDrivers,
    activeTrips,
    pendingTrips,
    completedTrips,
    availableVehicles,
    vehiclesInMaintenance,
    driversOnDuty,
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.driver.count(),
    prisma.trip.count({ where: { status: 'In_Progress' } }),
    prisma.trip.count({ where: { status: 'Scheduled' } }),
    prisma.trip.count({ where: { status: 'Completed' } }),
    prisma.vehicle.count({ where: { status: 'Available' } }),
    prisma.vehicle.count({ where: { status: 'In_Shop' } }),
    prisma.driver.count({ where: { status: 'On_Trip' } }),
  ]);

  // Fleet Utilization (%) = (vehicles with status On Trip) / (all non-Retired vehicles) * 100
  const totalNonRetired = await prisma.vehicle.count({
    where: { status: { not: 'Retired' } }
  });
  const vehiclesOnTrip = await prisma.vehicle.count({
    where: { status: 'On_Trip' }
  });
  const fleetUtilizationPct = totalNonRetired > 0 
    ? Number(((vehiclesOnTrip / totalNonRetired) * 100).toFixed(1)) 
    : 0;

  // Operational cost
  const [fuelAggregate, maintenanceAggregate] = await Promise.all([
    prisma.fuelLog.aggregate({ _sum: { totalCost: true } }),
    prisma.maintenanceLog.aggregate({ _sum: { cost: true } }),
  ]);

  const fuelTotal = Number(fuelAggregate._sum.totalCost || 0);
  const maintenanceTotal = Number(maintenanceAggregate._sum.cost || 0);
  const totalOperationalCost = fuelTotal + maintenanceTotal;

  // Estimated Revenue
  const tripsWithDistance = await prisma.trip.findMany({
    where: { status: 'Completed' },
    select: { distanceKm: true }
  });
  const totalDistance = tripsWithDistance.reduce((sum, t) => sum + Number(t.distanceKm || 0), 0);
  const totalRevenue = totalDistance * REVENUE_RATE_PER_KM;

  return {
    totalVehicles,
    activeVehicles: totalNonRetired,
    availableVehicles,
    vehiclesOnTrip,
    vehiclesInMaintenance,
    activeTrips,
    pendingTrips,
    completedTrips,
    totalDrivers,
    driversOnDuty,
    fleetUtilizationPct,
    totalFuelCost: fuelTotal,
    maintenanceCost: maintenanceTotal,
    totalOperationalCost,
    revenue: totalRevenue,
    profit: Math.max(0, totalRevenue - totalOperationalCost)
  };
};

const getFuelEfficiency = async () => {
  const completedTrips = await prisma.trip.findMany({
    where: { status: 'Completed' },
    select: { distanceKm: true, vehicleId: true }
  });

  const fuelLogs = await prisma.fuelLog.findMany({
    select: { litres: true, vehicleId: true }
  });

  const totalDistance = completedTrips.reduce((sum, t) => sum + Number(t.distanceKm || 0), 0);
  const totalLitres = fuelLogs.reduce((sum, f) => sum + Number(f.litres || 0), 0);

  const avgEfficiency = totalLitres > 0 ? Number((totalDistance / totalLitres).toFixed(2)) : 0;
  return {
    avgEfficiency, // km/l
    totalDistance,
    totalLitres
  };
};

const getVehicleROI = async () => {
  const vehicles = await prisma.vehicle.findMany({
    include: {
      trips: { where: { status: 'Completed' } },
      fuelLogs: true,
      maintenanceLogs: true
    }
  });

  const list = vehicles.map(v => {
    const revenue = v.trips.reduce((sum, t) => sum + (Number(t.distanceKm || 0) * REVENUE_RATE_PER_KM), 0);
    const fuelCost = v.fuelLogs.reduce((sum, f) => sum + Number(f.totalCost || 0), 0);
    const maintenanceCost = v.maintenanceLogs.reduce((sum, m) => sum + Number(m.cost || 0), 0);
    const acquisitionCost = Number(v.acquisitionCost || 0);

    const netEarnings = revenue - (fuelCost + maintenanceCost);
    const roiPct = acquisitionCost > 0 ? Number(((netEarnings / acquisitionCost) * 100).toFixed(2)) : 0;

    return {
      vehicleId: v.id,
      regNumber: v.regNumber,
      name: v.name,
      revenue,
      fuelCost,
      maintenanceCost,
      acquisitionCost,
      roi: roiPct
    };
  });

  const fleetAvgRoi = list.length > 0 
    ? Number((list.reduce((sum, item) => sum + item.roi, 0) / list.length).toFixed(2)) 
    : 0;

  return {
    fleetAvgRoi,
    vehicles: list
  };
};

const getMonthlyRevenue = async () => {
  const completedTrips = await prisma.trip.findMany({
    where: { status: 'Completed' },
    select: { completedAt: true, distanceKm: true }
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data = months.map(m => ({ month: m, revenue: 0, trips: 0 }));

  completedTrips.forEach(t => {
    if (!t.completedAt) return;
    const monthIdx = new Date(t.completedAt).getMonth();
    const rev = Number(t.distanceKm || 0) * REVENUE_RATE_PER_KM;
    data[monthIdx].revenue += rev;
    data[monthIdx].trips += 1;
  });

  return data;
};

const getTopCostliestVehicles = async () => {
  const vehicles = await prisma.vehicle.findMany({
    include: {
      fuelLogs: true,
      maintenanceLogs: true
    }
  });

  const list = vehicles.map(v => {
    const fuelCost = v.fuelLogs.reduce((sum, f) => sum + Number(f.totalCost || 0), 0);
    const maintenanceCost = v.maintenanceLogs.reduce((sum, m) => sum + Number(m.cost || 0), 0);
    return {
      id: v.id,
      regNumber: v.regNumber,
      name: v.name,
      totalCost: fuelCost + maintenanceCost,
      fuelCost,
      maintenanceCost
    };
  });

  return list.sort((a, b) => b.totalCost - a.totalCost).slice(0, 5);
};

module.exports = {
  getSummary,
  getFuelEfficiency,
  getVehicleROI,
  getMonthlyRevenue,
  getTopCostliestVehicles,
  REVENUE_RATE_PER_KM
};
