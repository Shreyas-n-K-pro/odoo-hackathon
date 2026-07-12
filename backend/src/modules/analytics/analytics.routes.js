// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Analytics Routes
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth.middleware');
const { requirePermission } = require('../../middleware/rbac.middleware');
const ctrl = require('./analytics.controller');

router.use(requireAuth);

router.get('/summary',                 requirePermission('analytics', 'view'), ctrl.getSummary);
router.get('/fuel-efficiency',         requirePermission('analytics', 'view'), ctrl.getFuelEfficiency);
router.get('/roi',                     requirePermission('analytics', 'view'), ctrl.getVehicleROI);
router.get('/monthly-revenue',         requirePermission('analytics', 'view'), ctrl.getMonthlyRevenue);
router.get('/top-costliest-vehicles', requirePermission('analytics', 'view'), ctrl.getTopCostliestVehicles);
router.get('/export',                  requirePermission('analytics', 'view'), ctrl.exportCSV);

module.exports = router;
