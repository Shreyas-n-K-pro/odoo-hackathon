export type UserRole = 'admin' | 'fleet_manager' | 'dispatcher' | 'safety_officer' | 'financial_analyst';

export enum Permission {
  VEHICLE_CREATE = 'VEHICLE_CREATE',
  VEHICLE_UPDATE = 'VEHICLE_UPDATE',
  VEHICLE_DELETE = 'VEHICLE_DELETE',
  DRIVER_CREATE = 'DRIVER_CREATE',
  DRIVER_UPDATE = 'DRIVER_UPDATE',
  DRIVER_SUSPEND = 'DRIVER_SUSPEND',
  DRIVER_LICENSE_RENEW = 'DRIVER_LICENSE_RENEW',
  TRIP_CREATE = 'TRIP_CREATE',
  TRIP_DISPATCH = 'TRIP_DISPATCH',
  TRIP_COMPLETE = 'TRIP_COMPLETE',
  TRIP_CANCEL = 'TRIP_CANCEL',
  MAINTENANCE_CREATE = 'MAINTENANCE_CREATE',
  MAINTENANCE_CLOSE = 'MAINTENANCE_CLOSE',
  FUEL_MANAGE = 'FUEL_MANAGE',
  EXPENSE_MANAGE = 'EXPENSE_MANAGE',
  REPORT_VIEW = 'REPORT_VIEW',
  REPORT_EXPORT = 'REPORT_EXPORT',
  DOCUMENT_UPLOAD = 'DOCUMENT_UPLOAD',
  USER_MANAGE = 'USER_MANAGE',
  SETTINGS_MANAGE = 'SETTINGS_MANAGE',
  AUDIT_VIEW = 'AUDIT_VIEW'
}


export type VehicleStatus = 'available' | 'on_trip' | 'maintenance' | 'retired';
export type DriverStatus = 'active' | 'suspended' | 'inactive';
export type TripStatus = 'draft' | 'approved' | 'dispatched' | 'on_route' | 'completed' | 'cancelled';
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  department?: string;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  model: string;
  type: 'truck' | 'van' | 'car' | 'bus';
  capacity: number;
  odometer: number;
  acquisitionCost: number;
  status: VehicleStatus;
  healthScore: number;
  fuelConsumption: number;
  lastMaintenanceDate?: string;
  nextMaintenanceKm: number;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  category: string;
  contact: string;
  safetyScore: number;
  experience: number;
  status: DriverStatus;
  licenseExpiryDate: string;
  tripsCompleted: number;
}

export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number;
  plannedDistance: number;
  revenue: number;
  status: TripStatus;
  createdDate: string;
  completedDate?: string;
  distance?: number;
  fuel?: number;
  expenses?: number;
}

export interface Maintenance {
  id: string;
  vehicleId: string;
  type: 'oil_change' | 'tyres' | 'engine' | 'brake' | 'insurance' | 'others';
  mechanic?: string;
  cost: number;
  date: string;
  status: MaintenanceStatus;
  description?: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  liters: number;
  price: number;
  date: string;
  odometer: number;
}

export interface Expense {
  id: string;
  category: 'fuel' | 'maintenance' | 'toll' | 'parking' | 'insurance' | 'miscellaneous';
  amount: number;
  date: string;
  vehicleId?: string;
  tripId?: string;
  description?: string;
}

export interface FleetHealthScore {
  score: number;
  maintenance: number;
  fuel: number;
  breakdowns: number;
  trips: number;
  age: number;
}

export interface DashboardKPI {
  totalVehicles: number;
  availableVehicles: number;
  vehiclesOnTrip: number;
  vehiclesInMaintenance: number;
  activeTrips: number;
  completedTripsToday: number;
  driversAvailable: number;
  driversOnDuty: number;
  fleetUtilization: number;
  totalFuelCost: number;
  maintenanceCost: number;
  revenue: number;
  profit: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface DispatchRecommendation {
  vehicleId: string;
  vehicleName: string;
  driverId: string;
  driverName: string;
  reasons: string[];
  score: number;
}
