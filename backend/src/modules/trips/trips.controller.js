const tripsService = require('./trips.service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const trips = await tripsService.getTrips(req.query);
    return sendSuccess(res, trips, 'Trips retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const trip = await tripsService.getTripById(req.params.id);
    if (!trip) return sendError(res, 'Trip not found.', 404, 'NOT_FOUND');
    return sendSuccess(res, trip, 'Trip retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const trip = await tripsService.createTrip(req.body);
    return sendSuccess(res, trip, 'Trip created successfully.', 201);
  } catch (err) {
    if (err.message.includes('not available') || err.message.includes('exceeds')) {
      return sendError(res, err.message, 400, 'VALIDATION_ERROR');
    }
    next(err);
  }
};

const dispatch = async (req, res, next) => {
  try {
    const trip = await tripsService.dispatchTrip(req.params.id);
    return sendSuccess(res, trip, 'Trip dispatched successfully.');
  } catch (err) {
    if (err.message.includes('not found') || err.message.includes('Scheduled') || err.message.includes('available')) {
      return sendError(res, err.message, 400, 'DISPATCH_ERROR');
    }
    next(err);
  }
};

const complete = async (req, res, next) => {
  try {
    const trip = await tripsService.completeTrip(req.params.id, req.body);
    return sendSuccess(res, trip, 'Trip completed successfully.');
  } catch (err) {
    if (err.message.includes('not found') || err.message.includes('In_Progress')) {
      return sendError(res, err.message, 400, 'COMPLETE_ERROR');
    }
    next(err);
  }
};

const cancel = async (req, res, next) => {
  try {
    const trip = await tripsService.cancelTrip(req.params.id);
    return sendSuccess(res, trip, 'Trip cancelled successfully.');
  } catch (err) {
    if (err.message.includes('not found')) {
      return sendError(res, err.message, 400, 'CANCEL_ERROR');
    }
    next(err);
  }
};

module.exports = { getAll, getById, create, dispatch, complete, cancel };
