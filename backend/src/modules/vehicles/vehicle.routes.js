// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Vehicle Routes
// GET    /api/vehicles          → All roles (view)
// GET    /api/vehicles/stats    → All roles (view)
// GET    /api/vehicles/:id      → All roles (view)
// POST   /api/vehicles          → Fleet Manager only (edit)
// PATCH  /api/vehicles/:id      → Fleet Manager only (edit)
// DELETE /api/vehicles/:id      → Fleet Manager only (soft retire)
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();

const ctrl = require('./vehicle.controller');
const { requireAuth } = require('../../middleware/auth.middleware');
const { requirePermission } = require('../../middleware/rbac.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createVehicleSchema, updateVehicleSchema } = require('./vehicle.validation');

// All routes require a valid JWT
router.use(requireAuth);

const costCtrl = require('../cost/cost.controller');

// Read operations — any authenticated role can view
router.get('/',      requirePermission('fleet', 'view'), ctrl.getAll);
router.get('/stats', requirePermission('fleet', 'view'), ctrl.getStats);
router.get('/:id/operational-cost', requirePermission('fleet', 'view'), costCtrl.getVehicleCost);
router.get('/:id',   requirePermission('fleet', 'view'), ctrl.getById);

// Write operations — Fleet Manager only
router.post('/',     requirePermission('fleet', 'edit'), validate(createVehicleSchema), ctrl.create);
router.patch('/:id', requirePermission('fleet', 'edit'), validate(updateVehicleSchema), ctrl.update);
router.delete('/:id',requirePermission('fleet', 'edit'), ctrl.retire);

module.exports = router;
