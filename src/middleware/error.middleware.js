// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Global Error Handler Middleware
// Catches all unhandled errors from controllers.
// Ensures no raw stack traces leak to the client.
// Must be registered LAST in app.js (after all routes).
// ─────────────────────────────────────────────────────────────────────────────

const logger = require('../utils/logger');
const { sendError } = require('../utils/apiResponse');

/**
 * Express 4-argument error handler (err, req, res, next)
 */
const errorHandler = (err, req, res, next) => {
  // Log the full error internally
  logger.error(`${err.message}`, { stack: err.stack, path: req.path, method: req.method });

  // Prisma-specific error handling
  if (err.code === 'P2002') {
    // Unique constraint violation
    const field = err.meta?.target?.join(', ') || 'field';
    return sendError(res, `Duplicate value: ${field} already exists.`, 409, 'DUPLICATE_ENTRY');
  }

  if (err.code === 'P2025') {
    // Record not found
    return sendError(res, 'Record not found.', 404, 'NOT_FOUND');
  }

  // Default internal server error — never expose stack to client
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred.'
    : err.message;

  return sendError(res, message, err.statusCode || 500, 'INTERNAL_ERROR');
};

/**
 * 404 handler — for undefined routes
 */
const notFoundHandler = (req, res) => {
  sendError(res, `Route ${req.method} ${req.path} not found.`, 404, 'ROUTE_NOT_FOUND');
};

module.exports = { errorHandler, notFoundHandler };
