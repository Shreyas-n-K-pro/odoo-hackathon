// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Vehicle Document Controller
// ─────────────────────────────────────────────────────────────────────────────

const svc = require('./documents.service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

// GET /api/documents?vehicleId=X  or  GET /api/documents (all)
const list = async (req, res) => {
  try {
    const { vehicleId } = req.query;
    const docs = await svc.listAll(vehicleId);
    return sendSuccess(res, docs, 'Documents fetched.');
  } catch (err) {
    return sendError(res, err.message || 'Failed to fetch documents.', err.status || 500);
  }
};

// GET /api/documents/expiring?days=30
const expiring = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const docs = await svc.listExpiring(days);
    return sendSuccess(res, docs, `Documents expiring within ${days} days.`);
  } catch (err) {
    return sendError(res, err.message || 'Failed to fetch expiring documents.', err.status || 500);
  }
};

// POST /api/documents
const create = async (req, res) => {
  try {
    const doc = await svc.create(req.body);
    return sendSuccess(res, doc, 'Document added.', 201);
  } catch (err) {
    return sendError(res, err.message || 'Failed to add document.', err.status || 500);
  }
};

// PUT /api/documents/:id
const update = async (req, res) => {
  try {
    const doc = await svc.update(req.params.id, req.body);
    return sendSuccess(res, doc, 'Document updated.');
  } catch (err) {
    return sendError(res, err.message || 'Failed to update document.', err.status || 500);
  }
};

// DELETE /api/documents/:id
const remove = async (req, res) => {
  try {
    await svc.remove(req.params.id);
    return sendSuccess(res, null, 'Document deleted.');
  } catch (err) {
    return sendError(res, err.message || 'Failed to delete document.', err.status || 500);
  }
};

module.exports = { list, expiring, create, update, remove };
