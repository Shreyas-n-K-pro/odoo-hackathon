// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Drivers Routes (STUB for Member B)
// Member B: Implement the controllers and service in this module.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth.middleware');
const { requirePermission } = require('../../middleware/rbac.middleware');
const { sendSuccess } = require('../../utils/apiResponse');

router.use(requireAuth);

// GET /api/drivers
router.get('/', requirePermission('drivers', 'view'), (req, res) => {
  sendSuccess(res, [], 'Drivers endpoint ready — Member B to implement.');
});

// POST /api/drivers
router.post('/', requirePermission('drivers', 'edit'), (req, res) => {
  sendSuccess(res, {}, 'Create driver — Member B to implement.', 201);
});

// PATCH /api/drivers/:id
router.patch('/:id', requirePermission('drivers', 'edit'), (req, res) => {
  sendSuccess(res, {}, 'Update driver — Member B to implement.');
});

module.exports = router;
