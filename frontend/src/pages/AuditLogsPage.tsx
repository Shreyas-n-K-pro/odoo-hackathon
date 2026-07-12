import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';


export const AuditLogsPage: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'dispatcher';

  // Hard route check: Only admin, fleet_manager, financial_analyst can view audit logs
  if (!['admin', 'fleet_manager', 'financial_analyst'].includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  const logs = [
    { id: '1', date: '2024-07-12T11:45:00', user: 'Alex Manager', action: 'CREATE_VEHICLE', details: 'Added new vehicle KA-01-AB-1234', ip: '192.168.1.5' },
    { id: '2', date: '2024-07-12T11:32:00', user: 'Super Admin', action: 'ASSIGN_ROLE', details: 'Updated Mike Analyst role from Fleet Manager to Financial Analyst', ip: '192.168.1.2' },
    { id: '3', date: '2024-07-12T10:15:00', user: 'John Dispatcher', action: 'DISPATCH_TRIP', details: 'Dispatched trip #2 from Delhi to Bangalore', ip: '192.168.1.18' },
    { id: '4', date: '2024-07-12T09:40:00', user: 'Sarah Officer', action: 'SUSPEND_DRIVER', details: 'Suspended driver Akshay Patel due to low safety score', ip: '192.168.1.10' },
    { id: '5', date: '2024-07-12T08:22:00', user: 'Mike Analyst', action: 'ADD_EXPENSE', details: 'Logged fuel expense for Vehicle #1: INR 9,150', ip: '192.168.1.25' },
  ];

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-light-primary-text dark:text-dark-primary-text mb-2">Audit Logs</h1>
        <p className="text-light-secondary-text dark:text-dark-secondary-text">Verifiable activity trails for compliance and security checks</p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-light-table_header dark:bg-dark-table_header text-light-secondary-text dark:text-dark-secondary-text border-b border-light-border dark:border-dark-border text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Timestamp</th>
                <th className="p-4 font-bold">Operator</th>
                <th className="p-4 font-bold">Action Key</th>
                <th className="p-4 font-bold">Activity Details</th>
                <th className="p-4 font-bold">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-divider dark:divide-dark-divider">
              {logs.map((log) => (
                <tr key={log.id} className="text-sm hover:bg-light-bg dark:hover:bg-dark-bg/50">
                  <td className="p-4 text-light-primary-text dark:text-dark-primary-text">
                    {new Date(log.date).toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 font-semibold text-teal-600 dark:text-teal-400">{log.user}</td>
                  <td className="p-4 font-mono text-xs text-light-primary-text dark:text-dark-primary-text">
                    <span className="px-2 py-1 bg-light-divider dark:bg-dark-border rounded-md text-xs font-semibold">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-light-primary-text dark:text-dark-primary-text">{log.details}</td>
                  <td className="p-4 text-light-secondary-text dark:text-dark-secondary-text font-mono text-xs">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </MainLayout>
  );
};
