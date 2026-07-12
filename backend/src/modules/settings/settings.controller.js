// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Settings Controller
// ─────────────────────────────────────────────────────────────────────────────

const settingsService = require('./settings.service');
const { sendSuccess } = require('../../utils/apiResponse');
const { z } = require('zod');

const updateSchema = z.object({
  depotName:    z.string().min(2).max(150).optional(),
  currency:     z.string().min(1).max(10).optional(),
  distanceUnit: z.string().min(1).max(20).optional(),
});

const getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    return sendSuccess(res, settings, 'Settings retrieved.');
  } catch (err) {
    next(err);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const data = updateSchema.parse(req.body);
    const settings = await settingsService.updateSettings(data);
    return sendSuccess(res, settings, 'Settings updated successfully.');
  } catch (err) {
    next(err);
  }
};

const getRbacMatrix = async (req, res, next) => {
  try {
    const matrix = settingsService.getRbacMatrix();
    return sendSuccess(res, matrix, 'RBAC matrix retrieved.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getSettings, updateSettings, getRbacMatrix };
