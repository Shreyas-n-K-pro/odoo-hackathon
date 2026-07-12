// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Auth Controller
// Thin layer: validates input, calls service, sends response.
// ─────────────────────────────────────────────────────────────────────────────

const authService = require('./auth.service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');
const logger = require('../../utils/logger');

const signup = async (req, res, next) => {
  try {
    const result = await authService.signup(req.body);
    logger.info(`New user registered: ${req.body.email} (${req.body.role})`);
    return sendSuccess(res, result, 'Account created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    logger.info(`Login success: ${req.body.email}`);
    return sendSuccess(res, result, 'Login successful.');
  } catch (err) {
    // Auth errors have a statusCode set by service
    if (err.statusCode) {
      return sendError(res, err.message, err.statusCode, err.code || 'AUTH_ERROR');
    }
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    if (!user) return sendError(res, 'User not found.', 404, 'NOT_FOUND');
    return sendSuccess(res, user, 'User profile retrieved.');
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, getMe };
