// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Settings Routes
// GET   /api/settings        → All authenticated roles
// PATCH /api/settings        → Fleet Manager only
// GET   /api/settings/rbac   → All authenticated roles
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();

const ctrl = require('./settings.controller');
const { requireAuth } = require('../../middleware/auth.middleware');
const { requirePermission } = require('../../middleware/rbac.middleware');

router.use(requireAuth);

router.get('/',      ctrl.getSettings);
router.patch('/',    requirePermission('settings', 'edit'), ctrl.updateSettings);
router.get('/rbac',  ctrl.getRbacMatrix);

module.exports = router;
