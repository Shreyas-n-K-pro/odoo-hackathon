import React, { useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useRBAC } from '../hooks/useRBAC';
import { Permission } from '../types';
import { Tooltip } from '../components/Tooltip';
import { Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const permissions = useRBAC(user?.role || 'dispatcher');

  const [companyName, setCompanyName] = useState('Aurora Logistics');
  const [address, setAddress] = useState('102, Bandra Kurla Complex, Mumbai');
  const [currency, setCurrency] = useState('INR');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Settings successfully updated!');
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-light-primary-text dark:text-dark-primary-text mb-2">Settings</h1>
        <p className="text-light-secondary-text dark:text-dark-secondary-text">Configure company and system preferences</p>
      </div>

      <Card className="max-w-2xl">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-light-primary-text dark:text-dark-primary-text mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-primary-text dark:text-dark-primary-text focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-light-primary-text dark:text-dark-primary-text mb-2">
              Headquarters Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-primary-text dark:text-dark-primary-text focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-light-primary-text dark:text-dark-primary-text mb-2">
                Currency Symbol
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-primary-text dark:text-dark-primary-text focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-light-primary-text dark:text-dark-primary-text mb-2">
                System Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-primary-text dark:text-dark-primary-text focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="Asia/Kolkata">IST (GMT+5:30)</option>
                <option value="America/New_York">EST (GMT-5:00)</option>
                <option value="Europe/London">GMT (GMT+0:00)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-light-border dark:border-dark-border">
            <Tooltip content={permissions.getExplanation(Permission.SETTINGS_MANAGE)} disabled={permissions.canAccessSettings}>
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={<Save className="w-5 h-5" />}
                disabled={!permissions.canAccessSettings}
              >
                Save Settings
              </Button>
            </Tooltip>
          </div>
        </form>
      </Card>
    </MainLayout>
  );
};
