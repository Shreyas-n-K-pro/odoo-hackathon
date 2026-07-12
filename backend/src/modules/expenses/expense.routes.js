// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Expense Routes
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();

const ctrl = require('./expense.controller');
const { requireAuth } = require('../../middleware/auth.middleware');
const { requirePermission } = require('../../middleware/rbac.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createExpenseSchema } = require('./expense.validation');

// All routes require valid JWT authentication
router.use(requireAuth);

// Read expenses — view permission for fuel required
router.get('/',  requirePermission('fuel', 'view'), ctrl.getAll);

// Write expenses — edit permission for fuel required
router.post('/', requirePermission('fuel', 'edit'), validate(createExpenseSchema), ctrl.create);

module.exports = router;
