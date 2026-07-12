// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Expense Service (Business Logic)
// ─────────────────────────────────────────────────────────────────────────────

const prisma = require('../../config/database');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');

/**
 * Get all expenses with optional vehicle filter, grouped/pivoted by vehicle, trip, and date.
 */
const getExpenses = async (query) => {
  const { vehicleId, search } = query;
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

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { incurredAt: 'desc' },
    include: {
      trip: true,
      vehicle: true,
    },
  });

  // Grouping logic by (vehicleId + tripId + date)
  const groups = {};
  expenses.forEach((exp) => {
    const dateStr = exp.incurredAt.toISOString().split('T')[0];
    const key = `${exp.vehicleId}-${exp.tripId || 'null'}-${dateStr}`;

    if (!groups[key]) {
      groups[key] = {
        id: exp.id, // reference ID for frontend key
        vehicleId: exp.vehicleId,
        vehicle: exp.vehicle,
        tripId: exp.tripId,
        trip: exp.trip,
        toll: 0,
        other: 0,
        maintenanceLinked: 0,
        total: 0,
        description: exp.description || '',
        expenseDate: exp.incurredAt,
      };
    }

    const amount = Number(exp.amount);
    if (exp.category === 'Toll') {
      groups[key].toll += amount;
    } else if (exp.category === 'Other' || exp.category === 'Fuel') {
      // Sumanth said fuel logs are tracked separately, so Fuel category fits here or is ignored
      groups[key].other += amount;
    } else if (exp.category === 'Maintenance') {
      groups[key].maintenanceLinked += amount;
    }
    groups[key].total += amount;
  });

  const groupedList = Object.values(groups);

  // Apply pagination on grouped list
  const total = groupedList.length;
  const paginatedList = groupedList.slice(skip, skip + take);

  return {
    expenses: paginatedList,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

/**
 * Create a new expense record (inserts separate category rows in a transaction)
 */
const createExpense = async (data) => {
  // 1. Verify vehicle exists
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: data.vehicleId },
  });

  if (!vehicle) {
    const err = new Error('Vehicle not found.');
    err.status = 404;
    throw err;
  }

  // 2. Validate at least one expense value is non-zero
  if (data.toll <= 0 && data.other <= 0 && data.maintenanceLinked <= 0) {
    const err = new Error('At least one expense amount (Toll, Other, or Maintenance) must be greater than zero.');
    err.status = 422;
    throw err;
  }

  // 3. Create expense records inside transaction
  return prisma.$transaction(async (tx) => {
    const createdExpenses = [];

    if (data.toll > 0) {
      const exp = await tx.expense.create({
        data: {
          vehicleId:   data.vehicleId,
          tripId:      data.tripId || null,
          category:    'Toll',
          amount:      data.toll,
          description: data.description || 'Toll fee',
          incurredAt:  data.expenseDate,
        },
      });
      createdExpenses.push(exp);
    }

    if (data.other > 0) {
      const exp = await tx.expense.create({
        data: {
          vehicleId:   data.vehicleId,
          tripId:      data.tripId || null,
          category:    'Other',
          amount:      data.other,
          description: data.description || 'Miscellaneous expense',
          incurredAt:  data.expenseDate,
        },
      });
      createdExpenses.push(exp);
    }

    if (data.maintenanceLinked > 0) {
      const exp = await tx.expense.create({
        data: {
          vehicleId:   data.vehicleId,
          tripId:      data.tripId || null,
          category:    'Maintenance',
          amount:      data.maintenanceLinked,
          description: data.description || 'Linked maintenance fee',
          incurredAt:  data.expenseDate,
        },
      });
      createdExpenses.push(exp);
    }

    return {
      vehicleId: data.vehicleId,
      tripId: data.tripId || null,
      expenseDate: data.expenseDate,
      items: createdExpenses,
    };
  });
};

module.exports = {
  getExpenses,
  createExpense,
};
