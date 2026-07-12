// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Analytics Routes (STUB for Member D)
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth.middleware');
const { requirePermission } = require('../../middleware/rbac.middleware');
const { sendSuccess } = require('../../utils/apiResponse');

router.use(requireAuth);

router.get('/summary', requirePermission('analytics', 'view'), (req, res) => {
  sendSuccess(res, {
    totalVehicles: 0, activeTrips: 0, totalDrivers: 0,
    monthlyFuelCost: 0, monthlyExpenses: 0,
  }, 'Analytics summary — Member D to implement.');
});

router.get('/fuel-trends',    requirePermission('analytics', 'view'), (req, res) => {
  sendSuccess(res, [], 'Fuel trends — Member D to implement.');
});

router.get('/trip-analytics', requirePermission('analytics', 'view'), (req, res) => {
  sendSuccess(res, [], 'Trip analytics — Member D to implement.');
});

module.exports = router;
