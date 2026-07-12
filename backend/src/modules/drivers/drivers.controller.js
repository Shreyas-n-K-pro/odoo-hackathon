const driversService = require('./drivers.service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const drivers = await driversService.getDrivers(req.query);
    return sendSuccess(res, drivers, 'Drivers retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const driver = await driversService.getDriverById(req.params.id);
    if (!driver) return sendError(res, 'Driver not found.', 404, 'NOT_FOUND');
    return sendSuccess(res, driver, 'Driver retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const driver = await driversService.createDriver(req.body);
    return sendSuccess(res, driver, 'Driver created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const driver = await driversService.updateDriver(req.params.id, req.body);
    return sendSuccess(res, driver, 'Driver updated successfully.');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const driver = await driversService.deleteDriver(req.params.id);
    return sendSuccess(res, driver, 'Driver removed successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
