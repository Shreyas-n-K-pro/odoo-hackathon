// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Fuel Routes (STUB for Member C)
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth.middleware');
const { requirePermission } = require('../../middleware/rbac.middleware');
const { sendSuccess } = require('../../utils/apiResponse');

router.use(requireAuth);

router.get('/',     requirePermission('fuel', 'view'), (req, res) => {
  sendSuccess(res, [], 'Fuel logs endpoint ready — Member C to implement.');
});
router.post('/',    requirePermission('fuel', 'edit'), (req, res) => {
  sendSuccess(res, {}, 'Create fuel log — Member C to implement.', 201);
});

module.exports = router;
