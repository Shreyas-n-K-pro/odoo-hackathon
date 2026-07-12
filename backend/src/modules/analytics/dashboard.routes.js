// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Dashboard Routes
// All endpoints are gated on the 'dashboard' module permission.
// Every role that has dashboard:view can see all KPI data.
// ─────────────────────────────────────────────────────────────────────────────
const express = require('express');
const router  = express.Router();
const { requireAuth }       = require('../../middleware/auth.middleware');
const { requirePermission } = require('../../middleware/rbac.middleware');
const ctrl = require('./dashboard.controller');

// Every dashboard consumer must be authenticated
router.use(requireAuth);

// All dashboard KPI routes — gate on 'dashboard' view (not 'analytics')
// Roles that can see the dashboard: Fleet_Manager, Dispatcher, Safety_Officer, Financial_Analyst
router.get('/kpis',                     requirePermission('dashboard', 'view'), ctrl.getKPIs);
router.get('/recent-trips',             requirePermission('dashboard', 'view'), ctrl.getRecentTrips);
router.get('/vehicle-status-breakdown', requirePermission('dashboard', 'view'), ctrl.getVehicleStatusBreakdown);
router.get('/monthly-fuel',             requirePermission('dashboard', 'view'), ctrl.getMonthlyFuel);
router.get('/monthly-trips',            requirePermission('dashboard', 'view'), ctrl.getMonthlyTrips);

module.exports = router;
