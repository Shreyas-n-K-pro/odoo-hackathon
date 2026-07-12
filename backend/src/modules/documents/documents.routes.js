// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Vehicle Document Routes
// All routes require authentication.
// Read:  fleet:view   (Fleet Manager, Dispatcher, Safety Officer, Financial Analyst)
// Write: fleet:edit   (Fleet Manager only)
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();
const { requireAuth }       = require('../../middleware/auth.middleware');
const { requirePermission } = require('../../middleware/rbac.middleware');
const ctrl = require('./documents.controller');

router.use(requireAuth);

// Read endpoints — any role that can view fleet
router.get('/',          requirePermission('fleet', 'view'), ctrl.list);
router.get('/expiring',  requirePermission('fleet', 'view'), ctrl.expiring);

// Write endpoints — Fleet Manager only
router.post('/',         requirePermission('fleet', 'edit'), ctrl.create);
router.put('/:id',       requirePermission('fleet', 'edit'), ctrl.update);
router.delete('/:id',    requirePermission('fleet', 'edit'), ctrl.remove);

module.exports = router;
