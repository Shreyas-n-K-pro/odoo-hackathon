import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card, KPICard } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { mockExpenses } from '../services/mockData';
import { useRBAC } from '../hooks/useRBAC';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types';
import { Tooltip } from '../components/Tooltip';
import { formatDate, formatCurrency } from '../utils/helpers';
import { Plus, Trash2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export const ExpensesPage: React.FC = () => {
  const { user } = useAuth();
  const permissions = useRBAC(user?.role || 'dispatcher');

  // Hard block Safety Officers from this page
  if (user?.role === 'safety_officer') {
    return <Navigate to="/dashboard" replace />;
  }

  const stats = {
    totalExpenses: mockExpenses.reduce((sum, e) => sum + e.amount, 0),
    fuelExpenses: mockExpenses.filter(e => e.category === 'fuel').reduce((sum, e) => sum + e.amount, 0),
    maintenanceExpenses: mockExpenses.filter(e => e.category === 'maintenance').reduce((sum, e) => sum + e.amount, 0),
    otherExpenses: mockExpenses.filter(e => !['fuel', 'maintenance'].includes(e.category)).reduce((sum, e) => sum + e.amount, 0),
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-light-primary-text dark:text-dark-primary-text">Expenses</h1>
            <p className="text-light-secondary-text dark:text-dark-secondary-text mt-1">Manage operational and trip expenses</p>
          </div>
          <Tooltip content={permissions.getExplanation(Permission.EXPENSE_MANAGE)} disabled={permissions.canEditExpenses}>
            <Button
              variant="primary"
              size="lg"
              icon={<Plus className="w-5 h-5" />}
              disabled={!permissions.canEditExpenses}
              onClick={() => alert('Add Expense form opened!')}
            >
              Add Expense
            </Button>
          </Tooltip>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Expenses" value={formatCurrency(stats.totalExpenses)} icon="💰" />
          <KPICard title="Fuel Expenses" value={formatCurrency(stats.fuelExpenses)} icon="⛽" />
          <KPICard title="Maintenance" value={formatCurrency(stats.maintenanceExpenses)} icon="🔧" />
          <KPICard title="Tolls & Misc" value={formatCurrency(stats.otherExpenses)} icon="🧾" />
        </div>
      </div>

      {/* Expense List */}
      <div className="space-y-4">
        {mockExpenses.map((expense) => (
          <Card key={expense.id}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-light-primary-text dark:text-dark-primary-text uppercase">
                    {expense.category} Expense
                  </h3>
                  <StatusBadge status="completed" label="Approved" />
                </div>
                <p className="text-sm text-light-secondary-text dark:text-dark-secondary-text mb-1">
                  Log Date: {formatDate(expense.date)} • Amount: <span className="font-bold text-lime-600 dark:text-lime-400">{formatCurrency(expense.amount)}</span>
                </p>
                {expense.vehicleId && (
                  <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text">
                    Assigned to: <span className="font-semibold text-teal-600">Vehicle #{expense.vehicleId}</span>
                  </p>
                )}
                {expense.tripId && (
                  <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text">
                    Assigned to: <span className="font-semibold text-teal-600">Trip #{expense.tripId}</span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Tooltip content={permissions.getExplanation(Permission.EXPENSE_MANAGE)} disabled={permissions.canEditExpenses}>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    icon={<Trash2 className="w-4 h-4" />}
                    disabled={!permissions.canEditExpenses}
                    onClick={() => alert('Expense deleted!')}
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
