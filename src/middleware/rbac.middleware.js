// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — RBAC Permission Middleware
// Uses the RBAC_MAP from constants.js to gate access by role + module.
// Must be used AFTER requireAuth (depends on req.user being set).
// ─────────────────────────────────────────────────────────────────────────────

const { RBAC_MAP, PERMISSION } = require('../config/constants');
const { sendError } = require('../utils/apiResponse');

/**
 * requirePermission factory
 * @param {string} module - e.g. 'fleet', 'trips', 'analytics'
 * @param {string} level  - 'view' | 'edit'
 * @returns Express middleware
 *
 * Usage:
 *   router.post('/', requireAuth, requirePermission('fleet', 'edit'), controller.create)
 */
const requirePermission = (module, level) => {
  return (req, res, next) => {
    const role = req.user?.role;

    if (!role || !RBAC_MAP[role]) {
      return sendError(res, 'Invalid role in token.', 403, 'FORBIDDEN');
    }

    const userPermission = RBAC_MAP[role][module] || PERMISSION.NONE;

    // Permission hierarchy: edit > view > none
    const hasAccess =
      userPermission === level ||
      (level === PERMISSION.VIEW && userPermission === PERMISSION.EDIT);

    if (!hasAccess) {
      return sendError(
        res,
        `Your role (${role}) does not have ${level} access to the ${module} module.`,
        403,
        'FORBIDDEN'
      );
    }

    next();
  };
};

module.exports = { requirePermission };
