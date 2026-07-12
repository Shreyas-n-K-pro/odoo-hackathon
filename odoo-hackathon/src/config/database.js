// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Prisma Client Singleton
// Ensures a single PrismaClient instance across the entire Node.js process.
// ─────────────────────────────────────────────────────────────────────────────

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
});

module.exports = prisma;
