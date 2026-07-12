// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Fuel Controller
// ─────────────────────────────────────────────────────────────────────────────

const fuelService = require('./fuel.service');
const { sendSuccess } = require('../../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const result = await fuelService.getFuelLogs(req.query);
    return sendSuccess(res, result, 'Fuel logs retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const log = await fuelService.createFuelLog(req.body);
    return sendSuccess(res, log, 'Fuel log added successfully.', 201);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  create,
};
