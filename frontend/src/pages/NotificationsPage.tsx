import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { Bell, AlertTriangle, CheckCircle, Info, Clock } from 'lucide-react';

const mockNotifications = [
  {
    id: '1',
    type: 'warning',
    title: 'License Expiry Alert',
    message: "Driver Akshay Patel's license expires in 4 days",
    timestamp: '2 hours ago',
    icon: AlertTriangle,
  },
  {
    id: '2',
    type: 'info',
    title: 'Maintenance Due',
    message: 'Vehicle 15 (Mahindra Bolero) is due for service in 500 km',
    timestamp: '5 hours ago',
    icon: Info,
  },
  {
    id: '3',
    type: 'success',
    title: 'Trip Completed',
    message: 'Mumbai → Pune trip completed successfully with ₹15,000 revenue',
    timestamp: '8 hours ago',
    icon: CheckCircle,
  },
  {
    id: '4',
    type: 'info',
    title: 'Trip Dispatched',
    message: 'Delhi → Bangalore trip has been dispatched with Driver Vikram Singh',
    timestamp: '1 day ago',
    icon: Clock,
  },
];

export const NotificationsPage: React.FC = () => {
  useAuth();

  const typeStyles = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  };

  const typeIconColor = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    info: 'text-blue-600',
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-teal-600" />
          <div>
            <h1 className="text-3xl font-bold text-light-primary-text dark:text-dark-primary-text">Notifications</h1>
            <p className="text-light-secondary-text dark:text-dark-secondary-text mt-1">Stay updated with important alerts</p>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {mockNotifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <Card key={notification.id} className={`border ${typeStyles[notification.type as keyof typeof typeStyles]}`}>
              <div className="flex gap-4">
                <Icon className={`${typeIconColor[notification.type as keyof typeof typeIconColor]} w-6 h-6 flex-shrink-0 mt-1`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h3 className="font-semibold text-light-primary-text dark:text-dark-primary-text">
                      {notification.title}
                    </h3>
                    <span className="text-xs text-light-secondary-text dark:text-dark-secondary-text whitespace-nowrap">
                      {notification.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-light-secondary-text dark:text-dark-secondary-text">
                    {notification.message}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </MainLayout>
  );
};
