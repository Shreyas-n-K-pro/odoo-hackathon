// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Rate Limiting Middleware
// Protects the auth endpoints from brute-force attacks.
// General API limiter prevents scraping / abuse.
// ─────────────────────────────────────────────────────────────────────────────

const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/apiResponse');

/**
 * authLimiter — applied to /api/auth/login and /api/auth/signup
 * Max 10 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendError(
      res,
      'Too many requests from this IP. Please try again after 15 minutes.',
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  },
});

/**
 * apiLimiter — applied to all other API routes
 * Max 200 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendError(
      res,
      'Too many requests. Please slow down.',
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  },
});

module.exports = { authLimiter, apiLimiter };
