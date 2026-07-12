// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Standard API Response Helper
// Enforces a consistent response envelope across all controllers.
// { success, data, message, error, details }
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send a success response
 * @param {Response} res - Express response object
 * @param {*} data - Response payload
 * @param {string} message - Human-readable message
 * @param {number} statusCode - HTTP status code (default 200)
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send an error response
 * @param {Response} res - Express response object
 * @param {string} message - Human-readable error message
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {string} error - Machine-readable error code (e.g. "VALIDATION_ERROR")
 * @param {Array} details - Array of field-level errors from Zod
 */
const sendError = (res, message = 'Internal Server Error', statusCode = 500, error = 'INTERNAL_ERROR', details = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
    details,
  });
};

module.exports = { sendSuccess, sendError };
