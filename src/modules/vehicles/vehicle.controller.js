// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Vehicle Controller
// ─────────────────────────────────────────────────────────────────────────────

const vehicleService = require('./vehicle.service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const result = await vehicleService.getVehicles(req.query);
    return sendSuccess(res, result, 'Vehicles retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await vehicleService.getVehicleStats();
    return sendSuccess(res, stats, 'Vehicle statistics retrieved.');
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    if (!vehicle) return sendError(res, 'Vehicle not found.', 404, 'NOT_FOUND');
    return sendSuccess(res, vehicle, 'Vehicle retrieved.');
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.createVehicle(req.body);
    return sendSuccess(res, vehicle, 'Vehicle added to fleet successfully.', 201);
  } catch (err) {
    next(err); // P2002 handled by global error handler → 409
  }
};

const update = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
    return sendSuccess(res, vehicle, 'Vehicle updated successfully.');
  } catch (err) {
    next(err);
  }
};

const retire = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.retireVehicle(req.params.id);
    return sendSuccess(res, vehicle, 'Vehicle has been retired.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getStats, getById, create, update, retire };
