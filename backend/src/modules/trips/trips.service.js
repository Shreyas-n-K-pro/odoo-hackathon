const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTrips = async (query = {}) => {
  const { status, vehicleId, driverId } = query;
  const where = {};
  if (status)    where.status    = status;
  if (vehicleId) where.vehicleId = parseInt(vehicleId);
  if (driverId)  where.driverId  = parseInt(driverId);

  return await prisma.trip.findMany({
    where,
    include: { vehicle: true, driver: true },
    orderBy: { scheduledAt: 'desc' }
  });
};

const getTripById = async (id) => {
  return await prisma.trip.findUnique({
    where: { id: parseInt(id) },
    include: { vehicle: true, driver: true, expenses: true }
  });
};

const generateTripCode = () =>
  `TRP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

// ─────────────────────────────────────────────────────────────────────────────
// RULE GUARDS — reused by createTrip AND dispatchTrip
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Throws if driver cannot be assigned:
 *  - status === Suspended
 *  - status !== Available
 *  - licenseExpiry in the past
 */
const assertDriverEligible = (driver) => {
  if (driver.status === 'Suspended') {
    const e = new Error('Driver is suspended and cannot be assigned to a trip.');
    e.status = 400; throw e;
  }
  if (driver.status !== 'Available') {
    const e = new Error(`Driver is not available (current status: ${driver.status}).`);
    e.status = 400; throw e;
  }
  if (driver.licenseExpiry && new Date(driver.licenseExpiry) < new Date()) {
    const expiry = new Date(driver.licenseExpiry).toLocaleDateString('en-IN');
    const e = new Error(`Driver's license expired on ${expiry}. Please renew before dispatching.`);
    e.status = 400; throw e;
  }
};

/**
 * Throws if vehicle cannot be dispatched:
 *  - status is In_Shop or Retired (explicit block per spec)
 *  - status is not Available
 *  - cargo exceeds capacity
 */
const assertVehicleEligible = (vehicle, cargoWeight) => {
  if (vehicle.status === 'Retired') {
    const e = new Error('Retired vehicles cannot be dispatched.');
    e.status = 400; throw e;
  }
  if (vehicle.status === 'In_Shop') {
    const e = new Error('Vehicle is currently in maintenance and cannot be dispatched.');
    e.status = 400; throw e;
  }
  if (vehicle.status !== 'Available') {
    const e = new Error(`Vehicle is not available (current status: ${vehicle.status}).`);
    e.status = 400; throw e;
  }
  if (cargoWeight != null && Number(vehicle.capacityKg) < Number(cargoWeight)) {
    const e = new Error(
      `Cargo weight (${cargoWeight} kg) exceeds vehicle capacity (${vehicle.capacityKg} kg).`
    );
    e.status = 400; throw e;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE TRIP — status: Scheduled
// ─────────────────────────────────────────────────────────────────────────────
const createTrip = async (data) => {
  const { vehicleId, driverId, origin, destination, scheduledAt, cargoWeight, notes } = data;

  const [vehicle, driver] = await Promise.all([
    prisma.vehicle.findUnique({ where: { id: vehicleId } }),
    prisma.driver.findUnique({ where: { id: driverId } }),
  ]);

  if (!vehicle) { const e = new Error('Vehicle not found.'); e.status = 404; throw e; }
  if (!driver)  { const e = new Error('Driver not found.');  e.status = 404; throw e; }

  // ── Mandatory business rules ──────────────────────────────────────────────
  assertVehicleEligible(vehicle, cargoWeight);
  assertDriverEligible(driver);

  return await prisma.trip.create({
    data: {
      tripCode: generateTripCode(),
      vehicleId, driverId, origin, destination,
      scheduledAt, cargoWeight, notes,
      status: 'Scheduled',
    },
    include: { vehicle: true, driver: true },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// DISPATCH TRIP — Scheduled → In_Progress; vehicle+driver → On_Trip
// ─────────────────────────────────────────────────────────────────────────────
const dispatchTrip = async (id) => {
  return await prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({
      where: { id: parseInt(id) },
      include: { vehicle: true, driver: true }
    });

    if (!trip) { const e = new Error('Trip not found.'); e.status = 404; throw e; }
    if (trip.status !== 'Scheduled') {
      const e = new Error(`Cannot dispatch — trip is currently '${trip.status}'.`);
      e.status = 400; throw e;
    }

    // Re-validate at dispatch time (vehicle or driver state may have changed)
    assertVehicleEligible(trip.vehicle, trip.cargoWeight);
    assertDriverEligible(trip.driver);

    const updatedTrip = await tx.trip.update({
      where: { id: parseInt(id) },
      data: { status: 'In_Progress' },
      include: { vehicle: true, driver: true },
    });

    await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'On_Trip' } });
    await tx.driver.update({ where: { id: trip.driverId },  data: { status: 'On_Trip' } });

    return updatedTrip;
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE TRIP — In_Progress → Completed; vehicle+driver → Available
// ─────────────────────────────────────────────────────────────────────────────
const completeTrip = async (id, data) => {
  const { distanceKm, fuelLitres, fuelPricePerLtr, expenseCategory, expenseAmount, expenseDescription } = data;

  return await prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({
      where: { id: parseInt(id) },
      include: { vehicle: true }
    });

    if (!trip) { const e = new Error('Trip not found.'); e.status = 404; throw e; }
    if (trip.status !== 'In_Progress') {
      const e = new Error(`Cannot complete — trip is currently '${trip.status}'.`);
      e.status = 400; throw e;
    }

    const newOdometer = (Number(trip.vehicle?.odometer) || 0) + Math.round(Number(distanceKm));

    const updatedTrip = await tx.trip.update({
      where: { id: parseInt(id) },
      data: { status: 'Completed', completedAt: new Date(), distanceKm: Number(distanceKm) },
    });

    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: 'Available', odometer: newOdometer },
    });
    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: 'Available', totalTrips: { increment: 1 } },
    });

    // Auto-log fuel if provided
    if (fuelLitres && fuelPricePerLtr) {
      await tx.fuelLog.create({
        data: {
          vehicleId:   trip.vehicleId,
          litres:      Number(fuelLitres),
          pricePerLtr: Number(fuelPricePerLtr),
          totalCost:   Number(fuelLitres) * Number(fuelPricePerLtr),
          odometer:    newOdometer,
          filledAt:    new Date(),
        },
      });
    }

    // Auto-log expense if provided
    if (expenseCategory && expenseAmount) {
      await tx.expense.create({
        data: {
          tripId:      trip.id,
          vehicleId:   trip.vehicleId,
          category:    expenseCategory,
          amount:      Number(expenseAmount),
          description: expenseDescription || 'Trip completion expense',
          incurredAt:  new Date(),
        },
      });
    }

    return updatedTrip;
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// CANCEL TRIP — Scheduled or In_Progress → Cancelled
//   In_Progress cancellation restores vehicle+driver to Available
//   BLOCKS: Completed and already-Cancelled trips
// ─────────────────────────────────────────────────────────────────────────────
const cancelTrip = async (id) => {
  return await prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id: parseInt(id) } });

    if (!trip) { const e = new Error('Trip not found.'); e.status = 404; throw e; }
    if (trip.status === 'Completed') {
      const e = new Error('Cannot cancel a trip that has already been completed.');
      e.status = 400; throw e;
    }
    if (trip.status === 'Cancelled') {
      const e = new Error('Trip is already cancelled.');
      e.status = 400; throw e;
    }

    const updatedTrip = await tx.trip.update({
      where: { id: parseInt(id) },
      data: { status: 'Cancelled' },
    });

    // Only restore if the trip was actively running
    if (trip.status === 'In_Progress') {
      await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'Available' } });
      await tx.driver.update({ where: { id: trip.driverId },  data: { status: 'Available' } });
    }

    return updatedTrip;
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE TRIP — Only Scheduled trips can be edited
// ─────────────────────────────────────────────────────────────────────────────
const updateTrip = async (id, data) => {
  const trip = await prisma.trip.findUnique({ where: { id: parseInt(id) } });
  if (!trip) { const e = new Error('Trip not found.'); e.status = 404; throw e; }
  if (trip.status !== 'Scheduled') {
    const e = new Error('Only Scheduled trips can be edited.');
    e.status = 400; throw e;
  }

  // Re-validate cargo capacity if vehicle or weight changed
  const vehicleId  = data.vehicleId  ? parseInt(data.vehicleId)  : trip.vehicleId;
  const cargoWeight = data.cargoWeight != null ? data.cargoWeight : trip.cargoWeight;
  if (cargoWeight != null) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (vehicle && Number(vehicle.capacityKg) < Number(cargoWeight)) {
      const e = new Error(
        `Cargo weight (${cargoWeight} kg) exceeds vehicle capacity (${vehicle.capacityKg} kg).`
      );
      e.status = 400; throw e;
    }
  }

  return await prisma.trip.update({
    where: { id: parseInt(id) },
    data,
    include: { vehicle: true, driver: true },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE TRIP — Only Scheduled trips
// ─────────────────────────────────────────────────────────────────────────────
const removeTrip = async (id) => {
  const trip = await prisma.trip.findUnique({ where: { id: parseInt(id) } });
  if (!trip) { const e = new Error('Trip not found.'); e.status = 404; throw e; }
  if (trip.status !== 'Scheduled') {
    const e = new Error('Only Scheduled trips can be deleted.');
    e.status = 400; throw e;
  }
  return await prisma.trip.delete({ where: { id: parseInt(id) } });
};

module.exports = {
  getTrips, getTripById,
  createTrip, dispatchTrip, completeTrip, cancelTrip,
  updateTrip, removeTrip,
};
