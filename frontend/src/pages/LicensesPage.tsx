import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useRBAC } from '../hooks/useRBAC';
import { Permission } from '../types';
import { Tooltip } from '../components/Tooltip';
import { formatDate } from '../utils/helpers';
import { Navigate } from 'react-router-dom';
import { KeyRound, Calendar } from 'lucide-react';

export const LicensesPage: React.FC = () => {
  const { user } = useAuth();
  const permissions = useRBAC(user?.role || 'dispatcher');
  const role = user?.role || 'dispatcher';

  // Security guard: Only Admin and Safety Officer can view licenses
  if (!['admin', 'safety_officer'].includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  const licenses = [
    { id: '1', driverName: 'Rajesh Kumar', licenseNo: 'DL-0001234', category: 'Heavy Commercial', expiry: '2025-12-31', status: 'valid' },
    { id: '2', driverName: 'Vikram Singh', licenseNo: 'HR-0005678', category: 'Heavy Commercial', expiry: '2025-08-15', status: 'valid' },
    { id: '3', driverName: 'Akshay Patel', licenseNo: 'GJ-0009101', category: 'Commercial Light', expiry: '2024-07-16', status: 'expiring' },
  ];

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-light-primary-text dark:text-dark-primary-text mb-2">Driver Licenses</h1>
        <p className="text-light-secondary-text dark:text-dark-secondary-text">Track and renew commercial driver permits</p>
      </div>

      {/* Licenses list */}
      <div className="space-y-4">
        {licenses.map((lic) => (
          <Card key={lic.id}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-light-primary-text dark:text-dark-primary-text">
                    {lic.driverName}
                  </h3>
                  {lic.status === 'expiring' ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                      Expiring Soon (4 days)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-sm text-light-secondary-text dark:text-dark-secondary-text mb-1">
                  License No: <span className="font-semibold">{lic.licenseNo}</span> • Category: {lic.category}
                </p>
                <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Expires: <span className="font-semibold">{formatDate(lic.expiry)}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip content={permissions.getExplanation(Permission.DRIVER_LICENSE_RENEW)} disabled={permissions.canRenewLicense}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    icon={<KeyRound className="w-4 h-4" />}
                    disabled={!permissions.canRenewLicense}
                    onClick={() => alert(`License renewal request sent for ${lic.driverName}!`)}
                  >
                    Renew Permit
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
