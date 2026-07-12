// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Cost Routes
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();

const ctrl = require('./cost.controller');
const { requireAuth } = require('../../middleware/auth.middleware');
const { requirePermission } = require('../../middleware/rbac.middleware');

router.use(requireAuth);

// Fleet-wide total cost
router.get('/total', requirePermission('fuel', 'view'), ctrl.getTotal);

module.exports = router;
