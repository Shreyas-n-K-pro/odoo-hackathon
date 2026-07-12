// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Express App Configuration
// Assembles all middleware and mounts all route modules.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const { apiLimiter }      = require('./middleware/rateLimit.middleware');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const logger              = require('./utils/logger');

// ── Route Modules ─────────────────────────────────────────────────────────────
const authRoutes        = require('./modules/auth/auth.routes');
const vehicleRoutes     = require('./modules/vehicles/vehicle.routes');
const settingsRoutes    = require('./modules/settings/settings.routes');
const driverRoutes      = require('./modules/drivers/drivers.routes');
const tripRoutes        = require('./modules/trips/trips.routes');
const maintenanceRoutes = require('./modules/maintenance/maintenance.routes');
const fuelRoutes        = require('./modules/fuel/fuel.routes');
const expenseRoutes     = require('./modules/expenses/expense.routes');
const costRoutes        = require('./modules/cost/cost.routes');
const analyticsRoutes   = require('./modules/analytics/analytics.routes');

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// ── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ── Request Parsing ───────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Logging (HTTP access log → Winston) ───────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

// ── Rate Limiting (general) ───────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'TransitOps API', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/vehicles',    vehicleRoutes);
app.use('/api/settings',    settingsRoutes);
app.use('/api/drivers',     driverRoutes);
app.use('/api/trips',       tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/fuel',        fuelRoutes);
app.use('/api/fuel-logs',   fuelRoutes);
app.use('/api/expenses',    expenseRoutes);
app.use('/api/operational-cost', costRoutes);
app.use('/api/analytics',   analyticsRoutes);

// ── Error Handling (must be last) ────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
