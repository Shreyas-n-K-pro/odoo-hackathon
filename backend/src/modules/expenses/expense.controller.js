// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Expense Controller
// ─────────────────────────────────────────────────────────────────────────────

const expenseService = require('./expense.service');
const { sendSuccess } = require('../../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const result = await expenseService.getExpenses(req.query);
    return sendSuccess(res, result, 'Expenses retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const log = await expenseService.createExpense(req.body);
    return sendSuccess(res, log, 'Expense added successfully.', 201);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  create,
};
