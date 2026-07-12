// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Fuel Routes
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();

const ctrl = require('./fuel.controller');
const { requireAuth } = require('../../middleware/auth.middleware');
const { requirePermission } = require('../../middleware/rbac.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createFuelLogSchema } = require('./fuel.validation');

// All routes require valid JWT authentication
router.use(requireAuth);

// Read fuel logs — view permission required
router.get('/',  requirePermission('fuel', 'view'), ctrl.getAll);

// Write fuel logs — edit permission required
router.post('/', requirePermission('fuel', 'edit'), validate(createFuelLogSchema), ctrl.create);

module.exports = router;
