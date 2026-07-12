import React, { useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card, KPICard } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { mockTrips } from '../services/mockData';
import { useRBAC } from '../hooks/useRBAC';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Permission } from '../types';
import { Tooltip } from '../components/Tooltip';
import { Plus, Search, Filter, ChevronRight } from 'lucide-react';

export const TripsPage: React.FC = () => {
  const { user } = useAuth();
  const permissions = useRBAC(user?.role || 'dispatcher');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTrips = mockTrips.filter(t =>
    t.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: mockTrips.length,
    active: mockTrips.filter(t => t.status === 'on_route').length,
    completed: mockTrips.filter(t => t.status === 'completed').length,
    totalRevenue: mockTrips.reduce((sum, t) => sum + t.revenue, 0),
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-light-primary-text dark:text-dark-primary-text">Trips</h1>
            <p className="text-light-secondary-text dark:text-dark-secondary-text mt-1">Manage deliveries and routes</p>
          </div>
          <Tooltip content={permissions.getExplanation(Permission.TRIP_CREATE)} disabled={permissions.canCreateTrip}>
            <Button
              variant="primary"
              size="lg"
              icon={<Plus className="w-5 h-5" />}
              disabled={!permissions.canCreateTrip}
              onClick={() => alert('Create Trip modal opened!')}
            >
              Create Trip
            </Button>
          </Tooltip>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Trips" value={stats.total} icon="🚛" />
          <KPICard title="Active" value={stats.active} icon="🚀" />
          <KPICard title="Completed" value={stats.completed} icon="✓" />
          <KPICard title="Revenue" value={formatCurrency(stats.totalRevenue)} icon="💰" />
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-light-secondary-text dark:text-dark-secondary-text" />
            <input
              type="text"
              placeholder="Search by source or destination..."
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

      {/* Trip List */}
      <div className="space-y-4">
        {filteredTrips.map((trip) => (
          <Card key={trip.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-light-primary-text dark:text-dark-primary-text">
                    {trip.source} → {trip.destination}
                  </h3>
                  <StatusBadge status={trip.status} label={trip.status.replace('_', ' ')} />
                </div>
                <p className="text-sm text-light-secondary-text dark:text-dark-secondary-text mb-3">
                  Created: {formatDate(trip.createdDate)} • Cargo: {trip.cargoWeight}kg • Distance: {trip.plannedDistance}km
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-light-secondary-text dark:text-dark-secondary-text text-xs">Revenue</p>
                    <p className="font-semibold text-lime-500">{formatCurrency(trip.revenue)}</p>
                  </div>
                  {trip.expenses && (
                    <div>
                      <p className="text-light-secondary-text dark:text-dark-secondary-text text-xs">Expenses</p>
                      <p className="font-semibold text-light-primary-text dark:text-dark-primary-text">
                        {formatCurrency(trip.expenses)}
                      </p>
                    </div>
                  )}
                  {trip.distance && (
                    <div>
                      <p className="text-light-secondary-text dark:text-dark-secondary-text text-xs">Actual Distance</p>
                      <p className="font-semibold text-light-primary-text dark:text-dark-primary-text">{trip.distance}km</p>
                    </div>
                  )}
                  {trip.completedDate && (
                    <div>
                      <p className="text-light-secondary-text dark:text-dark-secondary-text text-xs">Profit</p>
                      <p className="font-semibold text-lime-500">
                        {formatCurrency(trip.revenue - (trip.expenses || 0))}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" icon={<ChevronRight className="w-4 h-4" />}>
                  View
                </Button>
                
                {trip.status === 'draft' && (
                  <Tooltip content={permissions.getExplanation(Permission.TRIP_DISPATCH)} disabled={permissions.canDispatchTrip}>
                    <Button 
                      variant="primary" 
                      size="sm"
                      className="text-xs"
                      disabled={!permissions.canDispatchTrip}
                      onClick={(e) => { e.stopPropagation(); alert('Trip dispatched!'); }}
                    >
                      Dispatch
                    </Button>
                  </Tooltip>
                )}

                {trip.status === 'on_route' && (
                  <>
                    <Tooltip content={permissions.getExplanation(Permission.TRIP_COMPLETE)} disabled={permissions.canCompleteTrip}>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="text-xs"
                        disabled={!permissions.canCompleteTrip}
                        onClick={(e) => { e.stopPropagation(); alert('Trip marked as Completed!'); }}
                      >
                        Complete
                      </Button>
                    </Tooltip>

                    <Tooltip content={permissions.getExplanation(Permission.TRIP_CANCEL)} disabled={permissions.canCancelTrip}>
                      <Button 
                        variant="danger" 
                        size="sm"
                        className="text-xs !py-1"
                        disabled={!permissions.canCancelTrip}
                        onClick={(e) => { e.stopPropagation(); alert('Trip cancelled!'); }}
                      >
                        Cancel
                      </Button>
                    </Tooltip>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
};
