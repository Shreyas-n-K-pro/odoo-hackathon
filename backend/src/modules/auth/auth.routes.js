// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Auth Routes
// POST /api/auth/signup
// POST /api/auth/login
// GET  /api/auth/me
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();

const { signup, login, getMe } = require('./auth.controller');
const { validate } = require('../../middleware/validate.middleware');
const { requireAuth } = require('../../middleware/auth.middleware');
const { authLimiter } = require('../../middleware/rateLimit.middleware');
const { signupSchema, loginSchema } = require('./auth.validation');

// Public routes (rate-limited)
router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/login',  authLimiter, validate(loginSchema),  login);

// Protected route
router.get('/me', requireAuth, getMe);

module.exports = router;
