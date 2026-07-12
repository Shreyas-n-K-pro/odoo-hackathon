// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — JWT Auth Middleware
// Verifies the Bearer token and attaches req.user to the request.
// Every protected route uses this first, before RBAC checks.
// ─────────────────────────────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/apiResponse');

/**
 * requireAuth middleware
 * - Reads Authorization: Bearer <token>
 * - Verifies JWT using JWT_SECRET
 * - Attaches decoded payload as req.user
 * - Returns 401 if missing or invalid
 */
const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Access denied. No token provided.', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request (available in all downstream controllers)
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Session expired. Please log in again.', 401, 'TOKEN_EXPIRED');
    }
    return sendError(res, 'Invalid token.', 401, 'INVALID_TOKEN');
  }
};

module.exports = { requireAuth };
