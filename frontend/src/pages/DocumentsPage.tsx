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
import { FileText, Upload } from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const permissions = useRBAC(user?.role || 'dispatcher');
  const role = user?.role || 'dispatcher';

  // Security guard: Only Admin and Safety Officer can view documents page
  if (!['admin', 'safety_officer'].includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  const documents = [
    { id: '1', name: 'Fitness Certificate - MH-02-CD-5678', vehicle: 'MH-02-CD-5678', uploadDate: '2023-06-01', expiry: '2024-06-01', type: 'Fitness' },
    { id: '2', name: 'PUC Certification - KA-01-AB-1234', vehicle: 'KA-01-AB-1234', uploadDate: '2024-06-15', expiry: '2024-12-15', type: 'PUC' },
    { id: '3', name: 'Insurance policy - GJ-03-EF-9101', vehicle: 'GJ-03-EF-9101', uploadDate: '2023-08-20', expiry: '2024-08-20', type: 'Insurance' },
  ];

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-light-primary-text dark:text-dark-primary-text">Vehicle Documents</h1>
            <p className="text-light-secondary-text dark:text-dark-secondary-text mt-1">Manage registration certificates, PUC, and fitness files</p>
          </div>
          <Tooltip content={permissions.getExplanation(Permission.DOCUMENT_UPLOAD)} disabled={permissions.canUploadDocuments}>
            <Button
              variant="primary"
              size="lg"
              icon={<Upload className="w-5 h-5" />}
              disabled={!permissions.canUploadDocuments}
              onClick={() => alert('Document upload window opened!')}
            >
              Upload Doc
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Documents list */}
      <div className="space-y-4">
        {documents.map((doc) => (
          <Card key={doc.id}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-light-primary-text dark:text-dark-primary-text">
                    {doc.name}
                  </h3>
                  <p className="text-sm text-light-secondary-text dark:text-dark-secondary-text">
                    Vehicle: <span className="font-semibold text-teal-600">{doc.vehicle}</span> • Category: {doc.type}
                  </p>
                  <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text mt-1">
                    Uploaded: {formatDate(doc.uploadDate)} • Expiry: <span className="font-semibold text-red-500">{formatDate(doc.expiry)}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  View File
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
};
