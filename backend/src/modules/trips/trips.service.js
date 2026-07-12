const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTrips = async (query = {}) => {
  const { status, vehicleId, driverId } = query;
  const where = {};
  if (status) where.status = status;
  if (vehicleId) where.vehicleId = parseInt(vehicleId);
  if (driverId) where.driverId = parseInt(driverId);

  return await prisma.trip.findMany({
    where,
    include: {
      vehicle: true,
      driver: true
    },
    orderBy: { scheduledAt: 'desc' }
  });
};

const getTripById = async (id) => {
  return await prisma.trip.findUnique({
    where: { id: parseInt(id) },
    include: { vehicle: true, driver: true, expenses: true }
  });
};

const generateTripCode = () => {
  return `TRP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

const createTrip = async (data) => {
  const { vehicleId, driverId, origin, destination, scheduledAt, cargoWeight, notes } = data;
  
  // Verify Vehicle availability and capacity
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw new Error('Vehicle not found.');
  if (vehicle.status !== 'Available') throw new Error('Vehicle is not available.');
  if (cargoWeight && vehicle.capacityKg < cargoWeight) throw new Error('Cargo weight exceeds vehicle capacity.');

  // Verify Driver availability
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) throw new Error('Driver not found.');
  if (driver.status !== 'Available') throw new Error('Driver is not available.');

  return await prisma.trip.create({
    data: {
      tripCode: generateTripCode(),
      vehicleId,
      driverId,
      origin,
      destination,
      scheduledAt,
      cargoWeight,
      notes,
      status: 'Scheduled'
    }
  });
};

const dispatchTrip = async (id) => {
  return await prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id: parseInt(id) }, include: { vehicle: true, driver: true } });
    if (!trip) throw new Error('Trip not found.');
    if (trip.status !== 'Scheduled') throw new Error('Trip is not in Scheduled state.');

    if (trip.vehicle.status !== 'Available') throw new Error('Vehicle is no longer available.');
    if (trip.driver.status !== 'Available') throw new Error('Driver is no longer available.');

    const updatedTrip = await tx.trip.update({
      where: { id: parseInt(id) },
      data: { status: 'In_Progress' }
    });

    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: 'On_Trip' }
    });

    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: 'On_Trip' }
    });

    return updatedTrip;
  });
};

const completeTrip = async (id, data) => {
  const { distanceKm, fuelLitres, fuelPricePerLtr, expenseCategory, expenseAmount, expenseDescription } = data;

  return await prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id: parseInt(id) }, include: { vehicle: true } });
    if (!trip) throw new Error('Trip not found.');
    if (trip.status !== 'In_Progress') throw new Error('Trip is not In_Progress.');

    const newOdometer = trip.vehicle.odometer + Math.round(distanceKm);

    const updatedTrip = await tx.trip.update({
      where: { id: parseInt(id) },
      data: {
        status: 'Completed',
        completedAt: new Date(),
        distanceKm
      }
    });

    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: { 
        status: 'Available',
        odometer: newOdometer
      }
    });

    await tx.driver.update({
      where: { id: trip.driverId },
      data: { 
        status: 'Available',
        totalTrips: { increment: 1 }
      }
    });

    if (fuelLitres && fuelPricePerLtr) {
      await tx.fuelLog.create({
        data: {
          vehicleId: trip.vehicleId,
          litres: fuelLitres,
          pricePerLtr: fuelPricePerLtr,
          totalCost: fuelLitres * fuelPricePerLtr,
          odometer: newOdometer,
          filledAt: new Date()
        }
      });
    }

    if (expenseCategory && expenseAmount) {
      await tx.expense.create({
        data: {
          tripId: trip.id,
          vehicleId: trip.vehicleId,
          category: expenseCategory,
          amount: expenseAmount,
          description: expenseDescription || 'Trip completion expense',
          incurredAt: new Date()
        }
      });
    }

    return updatedTrip;
  });
};

const cancelTrip = async (id) => {
  return await prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id: parseInt(id) } });
    if (!trip) throw new Error('Trip not found.');
    
    const updatedTrip = await tx.trip.update({
      where: { id: parseInt(id) },
      data: { status: 'Cancelled' }
    });

    if (trip.status === 'In_Progress') {
      await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'Available' } });
      await tx.driver.update({ where: { id: trip.driverId }, data: { status: 'Available' } });
    }

    return updatedTrip;
  });
};

module.exports = {
  getTrips,
  getTripById,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip
};
