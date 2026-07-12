// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Trips Routes (STUB for Member B)
// Member B: Implement the controllers and service in this module.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth.middleware');
const { requirePermission } = require('../../middleware/rbac.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createTripSchema, updateTripSchema, completeTripSchema } = require('./trips.validation');
const ctrl = require('./trips.controller');

router.use(requireAuth);

router.get('/', requirePermission('trips', 'view'), ctrl.getAll);
router.get('/:id', requirePermission('trips', 'view'), ctrl.getById);

router.post('/', requirePermission('trips', 'edit'), validate(createTripSchema), ctrl.create);

router.patch('/:id/dispatch', requirePermission('trips', 'edit'), ctrl.dispatch);
router.patch('/:id/complete', requirePermission('trips', 'edit'), validate(completeTripSchema), ctrl.complete);
router.patch('/:id/cancel',   requirePermission('trips', 'edit'), ctrl.cancel);
router.delete('/:id',         requirePermission('trips', 'edit'), ctrl.remove);
router.patch('/:id',          requirePermission('trips', 'edit'), validate(updateTripSchema), ctrl.update);

module.exports = router;
