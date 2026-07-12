// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Maintenance Controller
// ─────────────────────────────────────────────────────────────────────────────

const maintenanceService = require('./maintenance.service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const result = await maintenanceService.getMaintenanceLogs(req.query);
    return sendSuccess(res, result, 'Maintenance logs retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const log = await maintenanceService.createMaintenanceLog(req.body);
    return sendSuccess(res, log, 'Maintenance log created and vehicle set to In Shop.', 201);
  } catch (err) {
    next(err);
  }
};

const close = async (req, res, next) => {
  try {
    const log = await maintenanceService.closeMaintenanceLog(req.params.id);
    return sendSuccess(res, log, 'Maintenance log closed and vehicle restored.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  create,
  close,
};
