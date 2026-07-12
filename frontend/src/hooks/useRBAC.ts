import { UserRole, Permission } from '../types';

// Map roles to their specific fine-grained permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    Permission.VEHICLE_CREATE,
    Permission.VEHICLE_UPDATE,
    Permission.VEHICLE_DELETE,
    Permission.DRIVER_CREATE,
    Permission.DRIVER_UPDATE,
    Permission.DRIVER_SUSPEND,
    Permission.DRIVER_LICENSE_RENEW,
    Permission.TRIP_CREATE,
    Permission.TRIP_DISPATCH,
    Permission.TRIP_COMPLETE,
    Permission.TRIP_CANCEL,
    Permission.MAINTENANCE_CREATE,
    Permission.MAINTENANCE_CLOSE,
    Permission.FUEL_MANAGE,
    Permission.EXPENSE_MANAGE,
    Permission.REPORT_VIEW,
    Permission.REPORT_EXPORT,
    Permission.DOCUMENT_UPLOAD,
    Permission.USER_MANAGE,
    Permission.SETTINGS_MANAGE,
    Permission.AUDIT_VIEW,
  ],
  fleet_manager: [
    Permission.VEHICLE_CREATE,
    Permission.VEHICLE_UPDATE,
    Permission.VEHICLE_DELETE,
    Permission.DRIVER_CREATE,
    Permission.DRIVER_UPDATE,
    Permission.MAINTENANCE_CREATE,
    Permission.MAINTENANCE_CLOSE,
    Permission.REPORT_VIEW,
    Permission.REPORT_EXPORT,
    Permission.DOCUMENT_UPLOAD,
    Permission.SETTINGS_MANAGE,
    Permission.AUDIT_VIEW,
  ],
  dispatcher: [
    Permission.TRIP_CREATE,
    Permission.TRIP_DISPATCH,
    Permission.TRIP_COMPLETE,
    Permission.TRIP_CANCEL,
    Permission.FUEL_MANAGE,
    Permission.REPORT_VIEW,
  ],
  safety_officer: [
    Permission.DRIVER_UPDATE,
    Permission.DRIVER_SUSPEND,
    Permission.DRIVER_LICENSE_RENEW,
    Permission.DOCUMENT_UPLOAD,
    Permission.REPORT_VIEW,
  ],
  financial_analyst: [
    Permission.FUEL_MANAGE,
    Permission.EXPENSE_MANAGE,
    Permission.REPORT_VIEW,
    Permission.REPORT_EXPORT,
    Permission.AUDIT_VIEW,
  ]
};

// Check if a role has a given permission
export const checkPermission = (role: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

// Friendly tooltip explanation for why an action is disabled
export const getPermissionExplanation = (permission: Permission): string => {
  const explanations: Record<Permission, string> = {
    [Permission.VEHICLE_CREATE]: 'Only Fleet Managers and Admins can add vehicles.',
    [Permission.VEHICLE_UPDATE]: 'Only Fleet Managers and Admins can edit vehicle details.',
    [Permission.VEHICLE_DELETE]: 'Only Fleet Managers and Admins can delete vehicles.',
    [Permission.DRIVER_CREATE]: 'Only Fleet Managers and Admins can add driver profiles.',
    [Permission.DRIVER_UPDATE]: 'Only Fleet Managers, Safety Officers, and Admins can edit drivers.',
    [Permission.DRIVER_SUSPEND]: 'Only Safety Officers and Admins can suspend or activate drivers.',
    [Permission.DRIVER_LICENSE_RENEW]: 'Only Safety Officers and Admins can renew driver licenses.',
    [Permission.TRIP_CREATE]: 'Only Dispatchers and Admins can create new trips.',
    [Permission.TRIP_DISPATCH]: 'Only Dispatchers and Admins can dispatch active trips.',
    [Permission.TRIP_COMPLETE]: 'Only Dispatchers and Admins can complete trips.',
    [Permission.TRIP_CANCEL]: 'Only Dispatchers and Admins can cancel trips.',
    [Permission.MAINTENANCE_CREATE]: 'Only Fleet Managers and Admins can schedule vehicle maintenance.',
    [Permission.MAINTENANCE_CLOSE]: 'Only Fleet Managers and Admins can close maintenance logs.',
    [Permission.FUEL_MANAGE]: 'Only Dispatchers, Financial Analysts, and Admins can manage fuel logs.',
    [Permission.EXPENSE_MANAGE]: 'Only Financial Analysts and Admins can manage expense logs.',
    [Permission.REPORT_VIEW]: 'Only authorized roles can access reports.',
    [Permission.REPORT_EXPORT]: 'Only Fleet Managers, Financial Analysts, and Admins can export reports.',
    [Permission.DOCUMENT_UPLOAD]: 'Only Fleet Managers, Safety Officers, and Admins can manage documents.',
    [Permission.USER_MANAGE]: 'Only Super Admins can manage users and roles.',
    [Permission.SETTINGS_MANAGE]: 'Only Fleet Managers and Admins can manage company settings.',
    [Permission.AUDIT_VIEW]: 'Only Fleet Managers, Financial Analysts, and Admins can view audit logs.',
  };
  return explanations[permission] || 'Action restricted by security policy.';
};

export const useRBAC = (userRole: UserRole) => {
  const hasPermission = (permission: Permission) => {
    return checkPermission(userRole, permission);
  };

  const getExplanation = (permission: Permission) => {
    return getPermissionExplanation(permission);
  };

  return {
    hasPermission,
    getExplanation,

    // Legacy backwards compatibility boolean flags
    canAddVehicle: hasPermission(Permission.VEHICLE_CREATE),
    canEditVehicle: hasPermission(Permission.VEHICLE_UPDATE),
    canDeleteVehicle: hasPermission(Permission.VEHICLE_DELETE),
    canRetireVehicle: hasPermission(Permission.VEHICLE_DELETE),
    canViewVehicles: true, // All roles can view
    canViewVehicleDocuments: hasPermission(Permission.DOCUMENT_UPLOAD) || ['fleet_manager', 'safety_officer', 'admin'].includes(userRole),
    canUploadDocuments: hasPermission(Permission.DOCUMENT_UPLOAD),

    canAddDriver: hasPermission(Permission.DRIVER_CREATE),
    canEditDriver: hasPermission(Permission.DRIVER_UPDATE),
    canSuspendDriver: hasPermission(Permission.DRIVER_SUSPEND),
    canActivateDriver: hasPermission(Permission.DRIVER_SUSPEND),
    canRenewLicense: hasPermission(Permission.DRIVER_LICENSE_RENEW),
    canViewDrivers: true, // All roles can view
    canViewDriverDetails: true,

    canCreateTrip: hasPermission(Permission.TRIP_CREATE),
    canDispatchTrip: hasPermission(Permission.TRIP_DISPATCH),
    canCompleteTrip: hasPermission(Permission.TRIP_COMPLETE),
    canCancelTrip: hasPermission(Permission.TRIP_CANCEL),
    canViewTrips: true, // All roles can view
    canViewTripDetails: true,

    canScheduleMaintenance: hasPermission(Permission.MAINTENANCE_CREATE),
    canCompleteMaintenance: hasPermission(Permission.MAINTENANCE_CLOSE),
    canViewMaintenance: true, // All roles can view

    canAddFuelLog: hasPermission(Permission.FUEL_MANAGE),
    canViewFuelLogs: true, // All roles can view
    canViewExpenses: userRole !== 'safety_officer', // Safety officer cannot view expenses
    canEditExpenses: hasPermission(Permission.EXPENSE_MANAGE),

    canViewReports: true, // All roles can view some reports
    canViewFinancialReports: userRole === 'financial_analyst' || userRole === 'admin' || userRole === 'fleet_manager',
    canViewFleetReports: userRole === 'fleet_manager' || userRole === 'admin',
    canExportReports: hasPermission(Permission.REPORT_EXPORT),

    canViewSafetyAlerts: userRole === 'safety_officer' || userRole === 'fleet_manager' || userRole === 'admin',
    canManageSafetyOfficers: userRole === 'admin',

    canManageUsers: hasPermission(Permission.USER_MANAGE),
    canAccessSettings: hasPermission(Permission.SETTINGS_MANAGE),
    canViewAuditLogs: hasPermission(Permission.AUDIT_VIEW),
  };
};
