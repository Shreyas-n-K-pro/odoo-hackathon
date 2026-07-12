import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card, KPICard } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { mockMaintenance } from '../services/mockData';
import { useRBAC } from '../hooks/useRBAC';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types';
import { Tooltip } from '../components/Tooltip';
import { formatDate, formatCurrency } from '../utils/helpers';
import { Plus, Check, Wrench } from 'lucide-react';

export const MaintenancePage: React.FC = () => {
  const { user } = useAuth();
  const permissions = useRBAC(user?.role || 'dispatcher');

  const stats = {
    total: mockMaintenance.length,
    completed: mockMaintenance.filter(m => m.status === 'completed').length,
    inProgress: mockMaintenance.filter(m => m.status === 'in_progress').length,
    totalCost: mockMaintenance.reduce((sum, m) => sum + m.cost, 0),
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-light-primary-text dark:text-dark-primary-text">Maintenance</h1>
            <p className="text-light-secondary-text dark:text-dark-secondary-text mt-1">Schedule and track vehicle service logs</p>
          </div>
          <Tooltip content={permissions.getExplanation(Permission.MAINTENANCE_CREATE)} disabled={permissions.canScheduleMaintenance}>
            <Button
              variant="primary"
              size="lg"
              icon={<Plus className="w-5 h-5" />}
              disabled={!permissions.canScheduleMaintenance}
              onClick={() => alert('Schedule Maintenance form opened!')}
            >
              Schedule Maintenance
            </Button>
          </Tooltip>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Records" value={stats.total} icon="🔧" />
          <KPICard title="In Progress" value={stats.inProgress} icon="⚙️" />
          <KPICard title="Completed" value={stats.completed} icon="✓" />
          <KPICard title="Total Expenses" value={formatCurrency(stats.totalCost)} icon="💰" />
        </div>
      </div>

      {/* Maintenance List */}
      <div className="space-y-4">
        {mockMaintenance.map((record) => (
          <Card key={record.id}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-light-primary-text dark:text-dark-primary-text">
                    Vehicle #{record.vehicleId} - {record.type.replace('_', ' ').toUpperCase()}
                  </h3>
                  <StatusBadge status={record.status} label={record.status.replace('_', ' ')} />
                </div>
                <p className="text-sm text-light-secondary-text dark:text-dark-secondary-text mb-2">
                  Scheduled Date: {formatDate(record.date)} • Cost: {formatCurrency(record.cost)}
                </p>
                {record.mechanic && (
                  <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text">
                    Service Center: <span className="font-semibold">{record.mechanic}</span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {record.status === 'in_progress' && (
                  <Tooltip content={permissions.getExplanation(Permission.MAINTENANCE_CLOSE)} disabled={permissions.canCompleteMaintenance}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      icon={<Check className="w-4 h-4" />}
                      disabled={!permissions.canCompleteMaintenance}
                      onClick={() => alert('Maintenance log closed successfully!')}
                    >
                      Close Log
                    </Button>
                  </Tooltip>
                )}
                <Button variant="ghost" size="sm" icon={<Wrench className="w-4 h-4" />}>
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
};
