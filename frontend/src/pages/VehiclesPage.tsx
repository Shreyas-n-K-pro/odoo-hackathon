import React, { useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card, KPICard } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { mockVehicles } from '../services/mockData';
import { useRBAC } from '../hooks/useRBAC';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types';
import { Tooltip } from '../components/Tooltip';
import { Plus, Search, Filter, ChevronRight } from 'lucide-react';

export const VehiclesPage: React.FC = () => {
  const { user } = useAuth();
  const permissions = useRBAC(user?.role || 'dispatcher');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVehicles = mockVehicles.filter(v =>
    v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: mockVehicles.length,
    available: mockVehicles.filter(v => v.status === 'available').length,
    onTrip: mockVehicles.filter(v => v.status === 'on_trip').length,
    maintenance: mockVehicles.filter(v => v.status === 'maintenance').length,
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-light-primary-text dark:text-dark-primary-text">Vehicles</h1>
            <p className="text-light-secondary-text dark:text-dark-secondary-text mt-1">Manage your fleet</p>
          </div>
          <Tooltip content={permissions.getExplanation(Permission.VEHICLE_CREATE)} disabled={permissions.canAddVehicle}>
            <Button
              variant="primary"
              size="lg"
              icon={<Plus className="w-5 h-5" />}
              disabled={!permissions.canAddVehicle}
              onClick={() => alert('Add Vehicle modal opened!')}
            >
              Add Vehicle
            </Button>
          </Tooltip>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Vehicles" value={stats.total} icon="🚚" />
          <KPICard title="Available" value={stats.available} icon="✓" />
          <KPICard title="On Trip" value={stats.onTrip} icon="🚛" />
          <KPICard title="Maintenance" value={stats.maintenance} icon="🔧" />
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-light-secondary-text dark:text-dark-secondary-text" />
            <input
              type="text"
              placeholder="Search by registration or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-primary-text dark:text-dark-primary-text"
            />
          </div>
          <Button variant="outline" size="md" icon={<Filter className="w-5 h-5" />}>
            Filter
          </Button>
        </div>
      </Card>

      {/* Vehicle List */}
      <div className="space-y-4">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-light-primary-text dark:text-dark-primary-text">
                    {vehicle.registrationNumber}
                  </h3>
                  <StatusBadge status={vehicle.status} label={vehicle.status.replace('_', ' ')} />
                </div>
                <p className="text-sm text-light-secondary-text dark:text-dark-secondary-text mb-3">
                  {vehicle.model} • {vehicle.type} • Capacity: {vehicle.capacity}kg
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-light-secondary-text dark:text-dark-secondary-text text-xs">Odometer</p>
                    <p className="font-semibold text-light-primary-text dark:text-dark-primary-text">{vehicle.odometer.toLocaleString()}km</p>
                  </div>
                  <div>
                    <p className="text-light-secondary-text dark:text-dark-secondary-text text-xs">Health Score</p>
                    <p className="font-semibold text-lime-500">{vehicle.healthScore}/100</p>
                  </div>
                  <div>
                    <p className="text-light-secondary-text dark:text-dark-secondary-text text-xs">Fuel Consumption</p>
                    <p className="font-semibold text-light-primary-text dark:text-dark-primary-text">{vehicle.fuelConsumption} km/l</p>
                  </div>
                  <div>
                    <p className="text-light-secondary-text dark:text-dark-secondary-text text-xs">Next Service</p>
                    <p className="font-semibold text-light-primary-text dark:text-dark-primary-text">
                      {(vehicle.nextMaintenanceKm - vehicle.odometer).toLocaleString()}km
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" icon={<ChevronRight className="w-4 h-4" />}>
                  View
                </Button>
                
                <Tooltip content={permissions.getExplanation(Permission.VEHICLE_UPDATE)} disabled={permissions.canEditVehicle}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-xs"
                    disabled={!permissions.canEditVehicle}
                    onClick={(e) => { e.stopPropagation(); alert('Edit Vehicle modal opened!'); }}
                  >
                    Edit
                  </Button>
                </Tooltip>

                <Tooltip content={permissions.getExplanation(Permission.DOCUMENT_UPLOAD)} disabled={permissions.canUploadDocuments}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-xs"
                    disabled={!permissions.canUploadDocuments}
                    onClick={(e) => { e.stopPropagation(); alert('Upload Document modal opened!'); }}
                  >
                    Upload Docs
                  </Button>
                </Tooltip>

                <Tooltip content={permissions.getExplanation(Permission.VEHICLE_DELETE)} disabled={permissions.canDeleteVehicle}>
                  <Button 
                    variant="danger" 
                    size="sm"
                    className="text-xs !py-1"
                    disabled={!permissions.canDeleteVehicle}
                    onClick={(e) => { e.stopPropagation(); alert('Delete Vehicle action triggered!'); }}
                  >
                    Delete
                  </Button>
                </Tooltip>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
};
