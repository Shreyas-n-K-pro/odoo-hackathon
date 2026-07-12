import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card, KPICard } from '../components/Card';
import { Button } from '../components/Button';
import { mockFuelLogs } from '../services/mockData';
import { useRBAC } from '../hooks/useRBAC';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types';
import { Tooltip } from '../components/Tooltip';
import { formatDate, formatCurrency } from '../utils/helpers';
import { Plus } from 'lucide-react';

export const FuelLogsPage: React.FC = () => {
  const { user } = useAuth();
  const permissions = useRBAC(user?.role || 'dispatcher');

  const stats = {
    totalLogs: mockFuelLogs.length,
    totalLiters: mockFuelLogs.reduce((sum, f) => sum + f.liters, 0),
    totalCost: mockFuelLogs.reduce((sum, f) => sum + f.price, 0),
    avgPrice: mockFuelLogs.reduce((sum, f) => sum + (f.price / f.liters), 0) / mockFuelLogs.length,
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-light-primary-text dark:text-dark-primary-text">Fuel Logs</h1>
            <p className="text-light-secondary-text dark:text-dark-secondary-text mt-1">Track vehicle fuel costs and efficiency</p>
          </div>
          <Tooltip content={permissions.getExplanation(Permission.FUEL_MANAGE)} disabled={permissions.canAddFuelLog}>
            <Button
              variant="primary"
              size="lg"
              icon={<Plus className="w-5 h-5" />}
              disabled={!permissions.canAddFuelLog}
              onClick={() => alert('Log Fuel Purchase form opened!')}
            >
              Log Fuel
            </Button>
          </Tooltip>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Logs" value={stats.totalLogs} icon="⛽" />
          <KPICard title="Total Liters" value={`${stats.totalLiters.toLocaleString()} L`} icon="💧" />
          <KPICard title="Total Fuel Cost" value={formatCurrency(stats.totalCost)} icon="💰" />
          <KPICard title="Avg Price/L" value={formatCurrency(stats.avgPrice)} icon="📈" />
        </div>
      </div>

      {/* Logs Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-light-table_header dark:bg-dark-table_header text-light-secondary-text dark:text-dark-secondary-text border-b border-light-border dark:border-dark-border text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Vehicle ID</th>
                <th className="p-4 font-bold text-right">Liters</th>
                <th className="p-4 font-bold text-right">Odometer</th>
                <th className="p-4 font-bold text-right">Total Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-divider dark:divide-dark-divider">
              {mockFuelLogs.map((log) => (
                <tr key={log.id} className="text-sm hover:bg-light-bg dark:hover:bg-dark-bg/50">
                  <td className="p-4 font-medium text-light-primary-text dark:text-dark-primary-text">{formatDate(log.date)}</td>
                  <td className="p-4 text-teal-600 dark:text-teal-400 font-semibold">Vehicle #{log.vehicleId}</td>
                  <td className="p-4 text-right text-light-primary-text dark:text-dark-primary-text">{log.liters} L</td>
                  <td className="p-4 text-right text-light-secondary-text dark:text-dark-secondary-text">{log.odometer.toLocaleString()} km</td>
                  <td className="p-4 text-right font-bold text-lime-600 dark:text-lime-400">{formatCurrency(log.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </MainLayout>
  );
};
