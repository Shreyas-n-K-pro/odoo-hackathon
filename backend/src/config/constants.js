// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Constants & RBAC Permission Map
// Single source of truth for roles, permissions, and enums.
// All middleware, controllers, and frontend hooks read from here.
// ─────────────────────────────────────────────────────────────────────────────

// ── Role Names ───────────────────────────────────────────────────────────────

const ROLES = Object.freeze({
  FLEET_MANAGER:     'Fleet_Manager',
  DISPATCHER:        'Dispatcher',
  SAFETY_OFFICER:    'Safety_Officer',
  FINANCIAL_ANALYST: 'Financial_Analyst',
});

// ── Permission Levels ────────────────────────────────────────────────────────

const PERMISSION = Object.freeze({
  NONE: 'none',
  VIEW: 'view',
  EDIT: 'edit',
});

// ── RBAC Map ─────────────────────────────────────────────────────────────────
// Structure: RBAC_MAP[role][module] = 'none' | 'view' | 'edit'
// 'edit'  → full read + write
// 'view'  → read only
// 'none'  → no access (403)

const RBAC_MAP = Object.freeze({
  [ROLES.FLEET_MANAGER]: {
    fleet:       PERMISSION.EDIT,
    drivers:     PERMISSION.EDIT,
    trips:       PERMISSION.VIEW,
    fuel:        PERMISSION.VIEW,
    analytics:   PERMISSION.EDIT,
    dashboard:   PERMISSION.VIEW,
    maintenance: PERMISSION.EDIT,
    settings:    PERMISSION.EDIT,
  },
  [ROLES.DISPATCHER]: {
    fleet:       PERMISSION.VIEW,
    drivers:     PERMISSION.VIEW,
    trips:       PERMISSION.EDIT,
    fuel:        PERMISSION.NONE,
    analytics:   PERMISSION.NONE,
    dashboard:   PERMISSION.VIEW,
    maintenance: PERMISSION.VIEW,
    settings:    PERMISSION.NONE,
  },
  [ROLES.SAFETY_OFFICER]: {
    fleet:       PERMISSION.NONE,
    drivers:     PERMISSION.EDIT,
    trips:       PERMISSION.VIEW,
    fuel:        PERMISSION.NONE,
    analytics:   PERMISSION.NONE,
    dashboard:   PERMISSION.VIEW,
    maintenance: PERMISSION.NONE,
    settings:    PERMISSION.NONE,
  },
  [ROLES.FINANCIAL_ANALYST]: {
    fleet:       PERMISSION.VIEW,
    drivers:     PERMISSION.NONE,
    trips:       PERMISSION.NONE,
    fuel:        PERMISSION.EDIT,
    analytics:   PERMISSION.EDIT,
    dashboard:   PERMISSION.VIEW,
    maintenance: PERMISSION.NONE,
    settings:    PERMISSION.NONE,
  },
});

// ── Auth Config ───────────────────────────────────────────────────────────────

const AUTH_CONFIG = Object.freeze({
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_MINUTES: 15,
  SALT_ROUNDS: 10,
});

// ── Vehicle / Driver Enums ────────────────────────────────────────────────────

const VEHICLE_TYPES   = ['Van', 'Truck', 'Mini'];
const VEHICLE_STATUSES = ['Available', 'On_Trip', 'In_Shop', 'Retired'];
const DRIVER_STATUSES  = ['Active', 'On_Leave', 'Inactive'];
const TRIP_STATUSES    = ['Scheduled', 'In_Progress', 'Completed', 'Cancelled'];

module.exports = {
  ROLES,
  PERMISSION,
  RBAC_MAP,
  AUTH_CONFIG,
  VEHICLE_TYPES,
  VEHICLE_STATUSES,
  DRIVER_STATUSES,
  TRIP_STATUSES,
};
