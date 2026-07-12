// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Cost Controller
// ─────────────────────────────────────────────────────────────────────────────

const costService = require('./cost.service');
const { sendSuccess } = require('../../utils/apiResponse');

const getTotal = async (req, res, next) => {
  try {
    const result = await costService.getFleetTotalCost();
    // Return standard payload.
    // If the caller wants a single number directly in a KPI card, they can access data.total.
    return sendSuccess(res, result, 'Fleet-wide operational cost retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

const getVehicleCost = async (req, res, next) => {
  try {
    const result = await costService.getVehicleOperationalCost(req.params.id);
    return sendSuccess(res, result, 'Vehicle operational cost retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTotal,
  getVehicleCost,
};
