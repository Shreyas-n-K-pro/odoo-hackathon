const svc = require('./dashboard.service');
const { sendSuccess } = require('../../utils/apiResponse');

const getKPIs = async (req, res, next) => {
  try {
    const data = await svc.getKPIs(req.query);
    return sendSuccess(res, data, 'Dashboard KPIs retrieved.');
  } catch (err) { next(err); }
};

const getRecentTrips = async (req, res, next) => {
  try {
    const data = await svc.getRecentTrips();
    return sendSuccess(res, data, 'Recent trips retrieved.');
  } catch (err) { next(err); }
};

const getVehicleStatusBreakdown = async (req, res, next) => {
  try {
    const data = await svc.getVehicleStatusBreakdown();
    return sendSuccess(res, data, 'Vehicle status breakdown retrieved.');
  } catch (err) { next(err); }
};

const getMonthlyFuel = async (req, res, next) => {
  try {
    const data = await svc.getMonthlyFuel();
    return sendSuccess(res, data, 'Monthly fuel cost retrieved.');
  } catch (err) { next(err); }
};

const getMonthlyTrips = async (req, res, next) => {
  try {
    const data = await svc.getMonthlyTrips();
    return sendSuccess(res, data, 'Monthly trips retrieved.');
  } catch (err) { next(err); }
};

module.exports = { getKPIs, getRecentTrips, getVehicleStatusBreakdown, getMonthlyFuel, getMonthlyTrips };
