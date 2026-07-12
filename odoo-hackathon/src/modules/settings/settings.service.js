// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Settings Service
// ─────────────────────────────────────────────────────────────────────────────

const prisma = require('../../config/database');
const { RBAC_MAP, ROLES, PERMISSION } = require('../../config/constants');

/**
 * Get settings (singleton row with id=1)
 */
const getSettings = async () => {
  return prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
};

/**
 * Update settings (Fleet Manager only)
 */
const updateSettings = async (data) => {
  return prisma.settings.update({
    where: { id: 1 },
    data,
  });
};

/**
 * Return the RBAC matrix as a structured JSON object for the frontend table.
 * Format: { roles: [...], modules: [...], matrix: { role: { module: permission } } }
 */
const getRbacMatrix = () => {
  const roles   = Object.values(ROLES);
  const modules = ['fleet', 'drivers', 'trips', 'fuel', 'analytics', 'dashboard', 'maintenance', 'settings'];

  // Build display-friendly matrix
  const matrix = {};
  for (const role of roles) {
    matrix[role] = {};
    for (const mod of modules) {
      matrix[role][mod] = RBAC_MAP[role][mod] || PERMISSION.NONE;
    }
  }

  return { roles, modules, matrix };
};

module.exports = { getSettings, updateSettings, getRbacMatrix };
