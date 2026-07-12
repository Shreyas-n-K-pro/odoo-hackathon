// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Pagination Helper
// Converts page/limit query params into Prisma-compatible skip/take/meta.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse pagination params from Express query string
 * @param {Object} query - req.query
 * @returns {{ skip: number, take: number, page: number, limit: number }}
 */
const parsePagination = (query) => {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip  = (page - 1) * limit;

  return { skip, take: limit, page, limit };
};

/**
 * Build a pagination metadata object for the response envelope
 * @param {number} total - Total record count from Prisma
 * @param {number} page
 * @param {number} limit
 * @returns {{ total, page, limit, totalPages, hasNext, hasPrev }}
 */
const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});

module.exports = { parsePagination, buildPaginationMeta };
