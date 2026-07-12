import { Vehicle, Driver, Trip, Maintenance, FuelLog, Expense, DashboardKPI, DispatchRecommendation } from '../types';

// Mock Vehicles
export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    registrationNumber: 'KA-01-AB-1234',
    model: 'Tata 407',
    type: 'truck',
    capacity: 5000,
    odometer: 145200,
    acquisitionCost: 850000,
    status: 'available',
    healthScore: 91,
    fuelConsumption: 4.2,
    lastMaintenanceDate: '2024-06-15',
    nextMaintenanceKm: 150000,
  },
  {
    id: '2',
    registrationNumber: 'MH-02-CD-5678',
    model: 'Ashok Leyland 1914',
    type: 'truck',
    capacity: 6000,
    odometer: 234500,
    acquisitionCost: 950000,
    status: 'on_trip',
    healthScore: 78,
    fuelConsumption: 3.8,
    lastMaintenanceDate: '2024-06-01',
    nextMaintenanceKm: 240000,
  },
  {
    id: '3',
    registrationNumber: 'GJ-03-EF-9101',
    model: 'Mahindra Bolero',
    type: 'van',
    capacity: 2000,
    odometer: 89200,
    acquisitionCost: 650000,
    status: 'maintenance',
    healthScore: 65,
    fuelConsumption: 5.5,
    lastMaintenanceDate: '2024-07-01',
    nextMaintenanceKm: 95000,
  },
];

// Mock Drivers
export const mockDrivers: Driver[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    licenseNumber: 'DL-0001234',
    category: 'Commercial',
    contact: '9876543210',
    safetyScore: 95,
    experience: 8,
    status: 'active',
    licenseExpiryDate: '2025-12-31',
    tripsCompleted: 145,
  },
  {
    id: '2',
    name: 'Vikram Singh',
    licenseNumber: 'HR-0005678',
    category: 'Commercial',
    contact: '9887654321',
    safetyScore: 88,
    experience: 5,
    status: 'active',
    licenseExpiryDate: '2025-08-15',
    tripsCompleted: 98,
  },
  {
    id: '3',
    name: 'Akshay Patel',
    licenseNumber: 'GJ-0009101',
    category: 'Commercial',
    contact: '9898765432',
    safetyScore: 72,
    experience: 3,
    status: 'suspended',
    licenseExpiryDate: '2025-11-20',
    tripsCompleted: 34,
  },
];

// Mock Trips
export const mockTrips: Trip[] = [
  {
    id: '1',
    source: 'Mumbai',
    destination: 'Pune',
    vehicleId: '1',
    driverId: '1',
    cargoWeight: 4800,
    plannedDistance: 180,
    revenue: 15000,
    status: 'completed',
    createdDate: '2024-07-10',
    completedDate: '2024-07-11',
    distance: 178,
    fuel: 42,
    expenses: 2500,
  },
  {
    id: '2',
    source: 'Delhi',
    destination: 'Bangalore',
    vehicleId: '2',
    driverId: '2',
    cargoWeight: 5500,
    plannedDistance: 2200,
    revenue: 95000,
    status: 'on_route',
    createdDate: '2024-07-11',
    distance: 1200,
    fuel: 310,
    expenses: 8500,
  },
  {
    id: '3',
    source: 'Chennai',
    destination: 'Hyderabad',
    vehicleId: '3',
    driverId: '1',
    cargoWeight: 1800,
    plannedDistance: 600,
    revenue: 22000,
    status: 'draft',
    createdDate: '2024-07-12',
  },
];

// Mock Maintenance
export const mockMaintenance: Maintenance[] = [
  {
    id: '1',
    vehicleId: '1',
    type: 'oil_change',
    mechanic: 'Ram Service Center',
    cost: 2500,
    date: '2024-07-01',
    status: 'completed',
  },
  {
    id: '2',
    vehicleId: '2',
    type: 'tyres',
    mechanic: 'Shri Tires',
    cost: 18000,
    date: '2024-06-25',
    status: 'completed',
  },
  {
    id: '3',
    vehicleId: '3',
    type: 'brake',
    mechanic: 'Pro Mechanics',
    cost: 5500,
    date: '2024-07-12',
    status: 'in_progress',
  },
];

// Mock Fuel Logs
export const mockFuelLogs: FuelLog[] = [
  {
    id: '1',
    vehicleId: '1',
    liters: 150,
    price: 9150,
    date: '2024-07-10',
    odometer: 145200,
  },
  {
    id: '2',
    vehicleId: '2',
    liters: 180,
    price: 10980,
    date: '2024-07-09',
    odometer: 234500,
  },
  {
    id: '3',
    vehicleId: '3',
    liters: 80,
    price: 4880,
    date: '2024-07-08',
    odometer: 89200,
  },
];

// Mock Expenses
export const mockExpenses: Expense[] = [
  {
    id: '1',
    category: 'fuel',
    amount: 9150,
    date: '2024-07-10',
    vehicleId: '1',
  },
  {
    id: '2',
    category: 'maintenance',
    amount: 5500,
    date: '2024-07-12',
    vehicleId: '3',
  },
  {
    id: '3',
    category: 'toll',
    amount: 2500,
    date: '2024-07-11',
    tripId: '2',
  },
  {
    id: '4',
    category: 'insurance',
    amount: 28000,
    date: '2024-07-01',
  },
];

// Mock KPIs
export const getMockKPIs = (): DashboardKPI => ({
  totalVehicles: 3,
  availableVehicles: 1,
  vehiclesOnTrip: 1,
  vehiclesInMaintenance: 1,
  activeTrips: 1,
  completedTripsToday: 2,
  driversAvailable: 2,
  driversOnDuty: 1,
  fleetUtilization: 66.67,
  totalFuelCost: 312000,
  maintenanceCost: 89000,
  revenue: 1250000,
  profit: 850000,
});

// Smart Dispatch Recommendation
export const getSmartDispatchRecommendation = (_sourceLocation: string): DispatchRecommendation => ({
  vehicleId: '1',
  vehicleName: 'Truck 1 (KA-01-AB-1234)',
  driverId: '1',
  driverName: 'Rajesh Kumar',
  reasons: [
    'Highest mileage capacity (5000 kg)',
    'Currently available',
    'Maintenance status OK',
    'Safety score: 95/100',
    'No active trips assigned',
  ],
  score: 94,
});

// Operational Insights
export const getOperationalInsights = () => [
  {
    title: 'Fuel Cost Increased',
    description: 'Fuel cost increased by 12% from last month',
    severity: 'warning',
    icon: '⚠️',
  },
  {
    title: 'Vehicle Idle Alert',
    description: 'Vehicle 5 has been idle for 14 days',
    severity: 'info',
    icon: 'ℹ️',
  },
  {
    title: 'Driver Performance',
    description: 'Driver Rajesh Kumar completed 35 trips this month',
    severity: 'success',
    icon: '✓',
  },
  {
    title: 'Maintenance Required',
    description: 'Vehicle 7 needs servicing - 500 km remaining',
    severity: 'warning',
    icon: '⚠️',
  },
];
