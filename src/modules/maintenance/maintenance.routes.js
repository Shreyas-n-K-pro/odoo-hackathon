// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Maintenance Routes (STUB for Member C)
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth.middleware');
const { requirePermission } = require('../../middleware/rbac.middleware');
const { sendSuccess } = require('../../utils/apiResponse');

router.use(requireAuth);

router.get('/',      requirePermission('maintenance', 'view'), (req, res) => {
  sendSuccess(res, [], 'Maintenance logs endpoint ready — Member C to implement.');
});
router.post('/',     requirePermission('maintenance', 'edit'), (req, res) => {
  sendSuccess(res, {}, 'Create maintenance log — Member C to implement.', 201);
});
router.patch('/:id', requirePermission('maintenance', 'edit'), (req, res) => {
  sendSuccess(res, {}, 'Update maintenance log — Member C to implement.');
});

module.exports = router;
