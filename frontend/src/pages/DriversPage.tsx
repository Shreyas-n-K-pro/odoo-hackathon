import React, { useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card, KPICard } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { mockDrivers } from '../services/mockData';
import { useRBAC } from '../hooks/useRBAC';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types';
import { Tooltip } from '../components/Tooltip';
import { Plus, Search, Filter, ChevronRight, Award } from 'lucide-react';

export const DriversPage: React.FC = () => {
  const { user } = useAuth();
  const permissions = useRBAC(user?.role || 'dispatcher');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDrivers = mockDrivers.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: mockDrivers.length,
    active: mockDrivers.filter(d => d.status === 'active').length,
    suspended: mockDrivers.filter(d => d.status === 'suspended').length,
    topDriver: mockDrivers.reduce((max, d) => d.safetyScore > max.safetyScore ? d : max),
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-light-primary-text dark:text-dark-primary-text">Drivers</h1>
            <p className="text-light-secondary-text dark:text-dark-secondary-text mt-1">Manage driver profiles and performance</p>
          </div>
          <Tooltip content={permissions.getExplanation(Permission.DRIVER_CREATE)} disabled={permissions.canAddDriver}>
            <Button
              variant="primary"
              size="lg"
              icon={<Plus className="w-5 h-5" />}
              disabled={!permissions.canAddDriver}
              onClick={() => alert('Add Driver modal opened!')}
            >
              Add Driver
            </Button>
          </Tooltip>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Drivers" value={stats.total} icon="👥" />
          <KPICard title="Active" value={stats.active} icon="✓" />
          <KPICard title="Suspended" value={stats.suspended} icon="⏸️" />
          <KPICard title="Top Safety Score" value={stats.topDriver.safetyScore} icon="⭐" />
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-light-secondary-text dark:text-dark-secondary-text" />
            <input
              type="text"
              placeholder="Search by name or license number..."
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

      {/* Driver List */}
      <div className="space-y-4">
        {filteredDrivers.map((driver) => (
          <Card key={driver.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-copper-600 text-white flex items-center justify-center font-bold">
                    {driver.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-light-primary-text dark:text-dark-primary-text">
                      {driver.name}
                    </h3>
                    <StatusBadge status={driver.status} label={driver.status} />
                  </div>
                </div>
                <p className="text-sm text-light-secondary-text dark:text-dark-secondary-text mb-3">
                  License: {driver.licenseNumber} • Category: {driver.category}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-light-secondary-text dark:text-dark-secondary-text text-xs">Safety Score</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Award className="w-4 h-4 text-lime-500" />
                      <p className="font-semibold text-lime-500">{driver.safetyScore}/100</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-light-secondary-text dark:text-dark-secondary-text text-xs">Experience</p>
                    <p className="font-semibold text-light-primary-text dark:text-dark-primary-text">{driver.experience} years</p>
                  </div>
                  <div>
                    <p className="text-light-secondary-text dark:text-dark-secondary-text text-xs">Trips Completed</p>
                    <p className="font-semibold text-light-primary-text dark:text-dark-primary-text">{driver.tripsCompleted}</p>
                  </div>
                  <div>
                    <p className="text-light-secondary-text dark:text-dark-secondary-text text-xs">License Expires</p>
                    <p className="font-semibold text-light-primary-text dark:text-dark-primary-text">
                      {new Date(driver.licenseExpiryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" icon={<ChevronRight className="w-4 h-4" />}>
                  View
                </Button>
                
                <Tooltip content={permissions.getExplanation(Permission.DRIVER_UPDATE)} disabled={permissions.canEditDriver}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-xs"
                    disabled={!permissions.canEditDriver}
                    onClick={(e) => { e.stopPropagation(); alert('Edit Driver profile opened!'); }}
                  >
                    Edit
                  </Button>
                </Tooltip>

                <Tooltip content={permissions.getExplanation(Permission.DRIVER_SUSPEND)} disabled={permissions.canSuspendDriver}>
                  <Button 
                    variant={driver.status === 'suspended' ? 'secondary' : 'danger'}
                    size="sm"
                    className="text-xs !py-1"
                    disabled={!permissions.canSuspendDriver}
                    onClick={(e) => { e.stopPropagation(); alert(`Driver status ${driver.status === 'suspended' ? 'activated' : 'suspended'}!`); }}
                  >
                    {driver.status === 'suspended' ? 'Activate' : 'Suspend'}
                  </Button>
                </Tooltip>

                <Tooltip content={permissions.getExplanation(Permission.DRIVER_LICENSE_RENEW)} disabled={permissions.canRenewLicense}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs !py-1 border-teal-600 text-teal-600 hover:bg-teal-50"
                    disabled={!permissions.canRenewLicense}
                    onClick={(e) => { e.stopPropagation(); alert('License renewal successfully logged!'); }}
                  >
                    Renew License
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
