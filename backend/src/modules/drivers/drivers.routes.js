// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Drivers Routes (STUB for Member B)
// Member B: Implement the controllers and service in this module.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth.middleware');
const { requirePermission } = require('../../middleware/rbac.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createDriverSchema, updateDriverSchema } = require('./drivers.validation');
const ctrl = require('./drivers.controller');

router.use(requireAuth);

router.get('/', requirePermission('drivers', 'view'), ctrl.getAll);
router.get('/:id', requirePermission('drivers', 'view'), ctrl.getById);

router.post('/check-expirations', requirePermission('drivers', 'edit'), ctrl.triggerExpiryCheck);

router.post('/', requirePermission('drivers', 'edit'), validate(createDriverSchema), ctrl.create);
router.patch('/:id', requirePermission('drivers', 'edit'), validate(updateDriverSchema), ctrl.update);
router.delete('/:id', requirePermission('drivers', 'edit'), ctrl.remove);

module.exports = router;
