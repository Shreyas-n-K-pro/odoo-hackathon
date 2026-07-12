const prisma = require('../../config/database');

// Revenue rate consistent with analytics.service.js
const REVENUE_RATE_PER_KM = 100;

/**
 * Dashboard KPI aggregation
 * GET /api/dashboard/kpis?type=&status=&region=
 */
const getKPIs = async (filters = {}) => {
  const { type, region } = filters;

  // Base vehicle filter
  const vehicleWhere = {};
  if (type)   vehicleWhere.type   = type;
  if (region) vehicleWhere.region = region;

  const [
    activeVehicles,
    availableVehicles,
    vehiclesInMaintenance,
    vehiclesOnTrip,
    activeTrips,
    pendingTrips,
    driversOnDuty,
  ] = await Promise.all([
    prisma.vehicle.count({ where: { ...vehicleWhere, status: { not: 'Retired' } } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: 'Available' } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: 'In_Shop' } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: 'On_Trip' } }),
    prisma.trip.count({ where: { status: 'In_Progress' } }),
    prisma.trip.count({ where: { status: 'Scheduled' } }),
    prisma.driver.count({ where: { status: 'On_Trip' } }),
  ]);

  const fleetUtilizationPct = activeVehicles > 0
    ? Number(((vehiclesOnTrip / activeVehicles) * 100).toFixed(1))
    : 0;

  // Financial KPIs
  const [fuelAgg, maintAgg] = await Promise.all([
    prisma.fuelLog.aggregate({ _sum: { totalCost: true } }),
    prisma.maintenanceLog.aggregate({ _sum: { cost: true } }),
  ]);

  const fuelTotal = Number(fuelAgg._sum.totalCost || 0);
  const maintenanceTotal = Number(maintAgg._sum.cost || 0);

  const completedTrips = await prisma.trip.findMany({
    where: { status: 'Completed' },
    select: { distanceKm: true }
  });
  const totalRevenue = completedTrips.reduce(
    (sum, t) => sum + (Number(t.distanceKm || 0) * REVENUE_RATE_PER_KM), 0
  );

  return {
    activeVehicles,
    availableVehicles,
    vehiclesInMaintenance,
    vehiclesOnTrip,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    fleetUtilizationPct,
    totalFuelCost: fuelTotal,
    maintenanceCost: maintenanceTotal,
    totalOperationalCost: fuelTotal + maintenanceTotal,
    revenue: totalRevenue,
    profit: Math.max(0, totalRevenue - (fuelTotal + maintenanceTotal)),
  };
};

/**
 * Last 8 trips (any status) with vehicle + driver
 * GET /api/dashboard/recent-trips
 */
const getRecentTrips = async () => {
  return prisma.trip.findMany({
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: {
      vehicle: { select: { name: true, regNumber: true } },
      driver:  { select: { name: true } }
    }
  });
};

/**
 * Vehicle count per status (for pie/bar chart)
 * GET /api/dashboard/vehicle-status-breakdown
 */
const getVehicleStatusBreakdown = async () => {
  const groups = await prisma.vehicle.groupBy({
    by: ['status'],
    _count: { status: true }
  });

  const statusMap = { Available: 0, On_Trip: 0, In_Shop: 0, Retired: 0 };
  groups.forEach(g => { statusMap[g.status] = g._count.status; });

  return [
    { name: 'Available',    value: statusMap.Available, fill: '#10B981' },
    { name: 'On Trip',      value: statusMap.On_Trip,   fill: '#3B82F6' },
    { name: 'In Shop',      value: statusMap.In_Shop,   fill: '#F97316' },
    { name: 'Retired',      value: statusMap.Retired,   fill: '#6B7280' },
  ];
};

/**
 * Monthly fuel cost (current year, grouped by month)
 * GET /api/dashboard/monthly-fuel
 */
const getMonthlyFuel = async () => {
  const fuelLogs = await prisma.fuelLog.findMany({
    where: {
      filledAt: {
        gte: new Date(new Date().getFullYear(), 0, 1) // Jan 1 this year
      }
    },
    select: { totalCost: true, filledAt: true }
  });

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const data = months.map(m => ({ month: m, fuel: 0 }));

  fuelLogs.forEach(log => {
    const idx = new Date(log.filledAt).getMonth();
    data[idx].fuel += Number(log.totalCost || 0);
  });

  return data;
};

/**
 * Monthly completed trip count (current year)
 * GET /api/dashboard/monthly-trips
 */
const getMonthlyTrips = async () => {
  const trips = await prisma.trip.findMany({
    where: {
      status: 'Completed',
      completedAt: { gte: new Date(new Date().getFullYear(), 0, 1) }
    },
    select: { completedAt: true }
  });

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const data = months.map(m => ({ month: m, trips: 0 }));

  trips.forEach(t => {
    if (!t.completedAt) return;
    const idx = new Date(t.completedAt).getMonth();
    data[idx].trips += 1;
  });

  return data;
};

module.exports = {
  getKPIs,
  getRecentTrips,
  getVehicleStatusBreakdown,
  getMonthlyFuel,
  getMonthlyTrips,
};
