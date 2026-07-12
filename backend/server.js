// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Server Entry Point
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config();
const app    = require('./src/app');
const prisma = require('./src/config/database');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Verify database connection before accepting requests
    await prisma.$connect();
    logger.info('✅ Database connection established');

    app.listen(PORT, () => {
      logger.info(`🚀 TransitOps API running on http://localhost:${PORT}`);
      logger.info(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`❤️  Health check: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    logger.error('❌ Failed to connect to database:', err);
    process.exit(1);
  }
};

// Graceful shutdown on SIGTERM/SIGINT
const shutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

startServer();
