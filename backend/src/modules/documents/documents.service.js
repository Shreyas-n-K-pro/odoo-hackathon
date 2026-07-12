// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Vehicle Document Service
// Manages RC, Insurance, PUC, Permit and other compliance docs per vehicle.
// ─────────────────────────────────────────────────────────────────────────────

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


/**
 * Compute expiry status from expiresAt date.
 * @param {Date} expiresAt
 * @returns {'Valid' | 'Expiring_Soon' | 'Expired'}
 */
const computeStatus = (expiresAt) => {
  const now  = new Date();
  const diff = Math.floor((new Date(expiresAt) - now) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return 'Expired';
  if (diff <= 30) return 'Expiring_Soon';
  return 'Valid';
};

/**
 * Attach computed status to each doc.
 */
const withStatus = (docs) =>
  docs.map(d => ({ ...d, status: computeStatus(d.expiresAt) }));

// ── List documents for a vehicle ─────────────────────────────────────────────
const listByVehicle = async (vehicleId) => {
  const docs = await prisma.vehicleDocument.findMany({
    where: { vehicleId: Number(vehicleId) },
    orderBy: { expiresAt: 'asc' },
  });
  return withStatus(docs);
};

// ── List all docs expiring within N days (for dashboard alert) ───────────────
const listExpiring = async (days = 30) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);

  const docs = await prisma.vehicleDocument.findMany({
    where: {
      expiresAt: { lte: cutoff },
    },
    include: {
      vehicle: { select: { id: true, regNumber: true, name: true } },
    },
    orderBy: { expiresAt: 'asc' },
  });
  return withStatus(docs);
};

// ── List ALL documents (for admin view) ──────────────────────────────────────
const listAll = async (vehicleId) => {
  const where = vehicleId ? { vehicleId: Number(vehicleId) } : {};
  const docs  = await prisma.vehicleDocument.findMany({
    where,
    include: {
      vehicle: { select: { id: true, regNumber: true, name: true } },
    },
    orderBy: { expiresAt: 'asc' },
  });
  return withStatus(docs);
};

// ── Create document ───────────────────────────────────────────────────────────
const create = async ({ vehicleId, docType, docNumber, issuedAt, expiresAt, notes }) => {
  if (!vehicleId) throw { status: 400, message: 'vehicleId is required.' };
  if (!docType)   throw { status: 400, message: 'docType is required.' };
  if (!expiresAt) throw { status: 400, message: 'expiresAt (expiry date) is required.' };

  // Verify vehicle exists
  const vehicle = await prisma.vehicle.findUnique({ where: { id: Number(vehicleId) } });
  if (!vehicle) throw { status: 404, message: `Vehicle #${vehicleId} not found.` };

  const doc = await prisma.vehicleDocument.create({
    data: {
      vehicleId:  Number(vehicleId),
      docType:    docType.trim(),
      docNumber:  docNumber?.trim() || null,
      issuedAt:   issuedAt  ? new Date(issuedAt)  : null,
      expiresAt:  new Date(expiresAt),
      notes:      notes?.trim() || null,
    },
    include: {
      vehicle: { select: { id: true, regNumber: true, name: true } },
    },
  });

  return { ...doc, status: computeStatus(doc.expiresAt) };
};

// ── Update document ───────────────────────────────────────────────────────────
const update = async (id, { docType, docNumber, issuedAt, expiresAt, notes }) => {
  const existing = await prisma.vehicleDocument.findUnique({ where: { id: Number(id) } });
  if (!existing) throw { status: 404, message: `Document #${id} not found.` };

  const doc = await prisma.vehicleDocument.update({
    where: { id: Number(id) },
    data: {
      ...(docType    !== undefined && { docType:   docType.trim() }),
      ...(docNumber  !== undefined && { docNumber: docNumber?.trim() || null }),
      ...(issuedAt   !== undefined && { issuedAt:  issuedAt ? new Date(issuedAt) : null }),
      ...(expiresAt  !== undefined && { expiresAt: new Date(expiresAt) }),
      ...(notes      !== undefined && { notes:     notes?.trim() || null }),
    },
    include: {
      vehicle: { select: { id: true, regNumber: true, name: true } },
    },
  });

  return { ...doc, status: computeStatus(doc.expiresAt) };
};

// ── Delete document ───────────────────────────────────────────────────────────
const remove = async (id) => {
  const existing = await prisma.vehicleDocument.findUnique({ where: { id: Number(id) } });
  if (!existing) throw { status: 404, message: `Document #${id} not found.` };
  await prisma.vehicleDocument.delete({ where: { id: Number(id) } });
};

module.exports = { listByVehicle, listExpiring, listAll, create, update, remove };
