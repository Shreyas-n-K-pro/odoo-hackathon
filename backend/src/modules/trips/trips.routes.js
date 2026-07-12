// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Trips Routes (STUB for Member B)
// Member B: Implement the controllers and service in this module.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth.middleware');
const { requirePermission } = require('../../middleware/rbac.middleware');
const { sendSuccess } = require('../../utils/apiResponse');

router.use(requireAuth);

router.get('/',     requirePermission('trips', 'view'), (req, res) => {
  sendSuccess(res, [], 'Trips endpoint ready — Member B to implement.');
});
router.post('/',    requirePermission('trips', 'edit'), (req, res) => {
  sendSuccess(res, {}, 'Create trip — Member B to implement.', 201);
});
router.patch('/:id',requirePermission('trips', 'edit'), (req, res) => {
  sendSuccess(res, {}, 'Update trip — Member B to implement.');
});

module.exports = router;
