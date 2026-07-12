import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card, KPICard } from '../components/Card';

import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { formatDate } from '../utils/helpers';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export const CompliancePage: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'dispatcher';

  // Security guard: Only Admin and Safety Officer can view compliance
  if (!['admin', 'safety_officer'].includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  const items = [
    { id: '1', asset: 'Vehicle KA-01-AB-1234', docType: 'PUC Certificate', expiry: '2024-12-15', status: 'valid' },
    { id: '2', asset: 'Vehicle MH-02-CD-5678', docType: 'Vehicle Fitness Cert', expiry: '2024-06-01', status: 'expired' },
    { id: '3', asset: 'Vehicle GJ-03-EF-9101', docType: 'Commercial Insurance', expiry: '2024-08-20', status: 'warning' },
    { id: '4', asset: 'Driver Rajesh Kumar', docType: 'Medical Fitness Certificate', expiry: '2025-05-10', status: 'valid' },
    { id: '5', asset: 'Driver Vikram Singh', docType: 'Commercial License Cert', expiry: '2025-08-15', status: 'valid' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <span className="flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle className="w-4 h-4" /> Valid</span>;
      case 'warning':
        return <span className="flex items-center gap-1 text-amber-500 font-semibold"><AlertTriangle className="w-4 h-4" /> Expiring Soon</span>;
      case 'expired':
        return <span className="flex items-center gap-1 text-red-600 font-semibold"><XCircle className="w-4 h-4" /> Expired</span>;
      default:
        return <span>Unknown</span>;
    }
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-light-primary-text dark:text-dark-primary-text mb-2">Compliance</h1>
        <p className="text-light-secondary-text dark:text-dark-secondary-text">Track regulatory status and document validity certificates</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <KPICard title="Total Certificates" value={5} icon="📋" />
        <KPICard title="Compliant Assets" value="4 / 5" icon="🛡️" />
        <KPICard title="Pending Issues" value={1} icon="⚠️" />
      </div>

      {/* Compliance List */}
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-light-primary-text dark:text-dark-primary-text mb-1">
                  {item.asset}
                </h3>
                <p className="text-sm text-light-secondary-text dark:text-dark-secondary-text">
                  Category: <span className="font-semibold">{item.docType}</span>
                </p>
                <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text mt-1">
                  Expiry Date: <span className="font-semibold">{formatDate(item.expiry)}</span>
                </p>
              </div>
              <div className="text-sm">
                {getStatusBadge(item.status)}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
};
