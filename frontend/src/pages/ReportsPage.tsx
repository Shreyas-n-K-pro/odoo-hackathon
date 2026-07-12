import React, { useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card, KPICard } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useRBAC } from '../hooks/useRBAC';
import { Permission } from '../types';
import { Tooltip } from '../components/Tooltip';
import { formatCurrency } from '../utils/helpers';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const permissions = useRBAC(user?.role || 'dispatcher');
  const role = user?.role || 'dispatcher';

  // Determine available tabs based on role
  const availableTabs = [];
  if (['admin', 'fleet_manager', 'dispatcher'].includes(role)) {
    availableTabs.push({ id: 'trips', name: 'Trips Report' });
  }
  if (['admin', 'fleet_manager', 'safety_officer'].includes(role)) {
    availableTabs.push({ id: 'safety', name: 'Safety Report' });
  }
  if (['admin', 'fleet_manager', 'financial_analyst'].includes(role)) {
    availableTabs.push({ id: 'financial', name: 'Financial Report' });
  }

  const [activeTab, setActiveTab] = useState(availableTabs[0]?.id || 'trips');

  // Mock data for reports
  const tripReportsData = [
    { name: 'Week 1', completed: 12, active: 4, cancelled: 1 },
    { name: 'Week 2', completed: 15, active: 3, cancelled: 0 },
    { name: 'Week 3', completed: 18, active: 5, cancelled: 2 },
    { name: 'Week 4', completed: 22, active: 2, cancelled: 1 },
  ];

  const safetyReportsData = [
    { name: 'Rajesh', score: 95, alerts: 1 },
    { name: 'Vikram', score: 88, alerts: 3 },
    { name: 'Akshay', score: 72, alerts: 8 },
  ];

  const financialReportsData = [
    { name: 'Jan', revenue: 250000, expenses: 140000 },
    { name: 'Feb', revenue: 310000, expenses: 160000 },
    { name: 'Mar', revenue: 290000, expenses: 155000 },
    { name: 'Apr', revenue: 380000, expenses: 210000 },
    { name: 'May', revenue: 340000, expenses: 190000 },
    { name: 'Jun', revenue: 420000, expenses: 220000 },
  ];

  const handleExport = (format: 'CSV' | 'PDF') => {
    alert(`Exporting ${activeTab.toUpperCase()} report in ${format} format!`);
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-light-primary-text dark:text-dark-primary-text">Reports</h1>
            <p className="text-light-secondary-text dark:text-dark-secondary-text mt-1">Analyze system activity and download records</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Tooltip content={permissions.getExplanation(Permission.REPORT_EXPORT)} disabled={permissions.canExportReports}>
              <Button
                variant="outline"
                size="md"
                icon={<Download className="w-4.5 h-4.5" />}
                disabled={!permissions.canExportReports}
                onClick={() => handleExport('CSV')}
              >
                Export CSV
              </Button>
            </Tooltip>
            
            <Tooltip content={permissions.getExplanation(Permission.REPORT_EXPORT)} disabled={permissions.canExportReports}>
              <Button
                variant="primary"
                size="md"
                icon={<Download className="w-4.5 h-4.5" />}
                disabled={!permissions.canExportReports}
                onClick={() => handleExport('PDF')}
              >
                Export PDF
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Dynamic Tabs */}
        {availableTabs.length > 1 && (
          <div className="flex border-b border-light-border dark:border-dark-border mb-6">
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-6 font-semibold text-sm transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400'
                    : 'text-light-secondary-text dark:text-dark-secondary-text hover:text-light-primary-text dark:hover:text-dark-primary-text'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Render Active Tab */}
      {activeTab === 'trips' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KPICard title="Trips Logged" value={67} icon="🗺️" />
            <KPICard title="Completion Rate" value="95.5%" icon="✓" />
            <KPICard title="Cancelled Trips" value={3} icon="❌" />
          </div>
          <Card>
            <h2 className="text-lg font-bold text-light-primary-text dark:text-dark-primary-text mb-4">Trip Volume Summary</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tripReportsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip />
                <Legend />
                <Bar dataKey="completed" fill="#0F766E" name="Completed" />
                <Bar dataKey="active" fill="#006D86" name="Active" />
                <Bar dataKey="cancelled" fill="#B42334" name="Cancelled" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {activeTab === 'safety' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KPICard title="Avg Safety Score" value={85} icon="⭐" />
            <KPICard title="Critical Alerts" value={12} icon="⚠️" />
            <KPICard title="Compliant Drivers" value="2 / 3" icon="👤" />
          </div>
          <Card>
            <h2 className="text-lg font-bold text-light-primary-text dark:text-dark-primary-text mb-4">Driver Safety Ratings & Alerts</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={safetyReportsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip />
                <Legend />
                <Bar dataKey="score" fill="#1F7A43" name="Safety Score" />
                <Bar dataKey="alerts" fill="#B42334" name="Critical Alerts" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KPICard title="Total Income" value={formatCurrency(2030000)} icon="💰" />
            <KPICard title="Total Outflow" value={formatCurrency(1075000)} icon="📈" />
            <KPICard title="Net Profit" value={formatCurrency(955000)} icon="📊" />
          </div>
          <Card>
            <h2 className="text-lg font-bold text-light-primary-text dark:text-dark-primary-text mb-4">Revenue vs Expense Logs</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={financialReportsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#1F7A43" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#B42334" strokeWidth={2} name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </MainLayout>
  );
};
