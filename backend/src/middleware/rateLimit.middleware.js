// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Rate Limiting Middleware
// authLimiter:  brute-force protection on /api/auth/*
// apiLimiter:   general abuse protection on all other routes
// dashLimiter:  relaxed limiter for high-frequency dashboard polling
// ─────────────────────────────────────────────────────────────────────────────

const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/apiResponse');

/**
 * authLimiter — /api/auth/login + /api/auth/signup
 * Max 10 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendError(res, 'Too many login attempts. Try again in 15 minutes.', 429, 'RATE_LIMIT_EXCEEDED');
  },
});

/**
 * apiLimiter — general API routes
 * Max 1000 requests per 15 minutes per IP
 * (Dashboard polls 5 endpoints × 6/min × 15min = 450 requests baseline)
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendError(res, 'Too many requests. Please slow down.', 429, 'RATE_LIMIT_EXCEEDED');
  },
});

/**
 * dashLimiter — /api/dashboard/* only
 * Very relaxed: 2000 per 15 minutes to support 10s polling
 */
const dashLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendError(res, 'Dashboard rate limit exceeded.', 429, 'RATE_LIMIT_EXCEEDED');
  },
});

module.exports = { authLimiter, apiLimiter, dashLimiter };
