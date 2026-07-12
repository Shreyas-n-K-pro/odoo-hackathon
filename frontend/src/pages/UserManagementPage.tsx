import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { KeyRound, UserCog } from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { user } = useAuth();

  // Hard route guard: Only Admin can load this page
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const systemUsers = [
    { id: '1', name: 'Super Admin', email: 'admin@transitops.com', role: 'admin', department: 'Administration', status: 'active' },
    { id: '2', name: 'Alex Manager', email: 'manager@transitops.com', role: 'fleet_manager', department: 'Operations', status: 'active' },
    { id: '3', name: 'John Dispatcher', email: 'dispatcher@transitops.com', role: 'dispatcher', department: 'Dispatch', status: 'active' },
    { id: '4', name: 'Sarah Officer', email: 'safety@transitops.com', role: 'safety_officer', department: 'Safety', status: 'active' },
    { id: '5', name: 'Mike Analyst', email: 'analyst@transitops.com', role: 'financial_analyst', department: 'Finance', status: 'active' },
  ];

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-light-primary-text dark:text-dark-primary-text mb-2">User Management</h1>
        <p className="text-light-secondary-text dark:text-dark-secondary-text">Admin operations: Manage system roles, permissions, and passwords</p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-light-table_header dark:bg-dark-table_header text-light-secondary-text dark:text-dark-secondary-text border-b border-light-border dark:border-dark-border text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Name & Email</th>
                <th className="p-4 font-bold">Role</th>
                <th className="p-4 font-bold">Department</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-divider dark:divide-dark-divider">
              {systemUsers.map((u) => (
                <tr key={u.id} className="text-sm hover:bg-light-bg dark:hover:bg-dark-bg/50">
                  <td className="p-4">
                    <p className="font-semibold text-light-primary-text dark:text-dark-primary-text">{u.name}</p>
                    <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text">{u.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-teal-600 dark:text-teal-400 capitalize">
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-light-secondary-text dark:text-dark-secondary-text">{u.department}</td>
                  <td className="p-4">
                    <StatusBadge status="available" label={u.status} />
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<UserCog className="w-4 h-4" />}
                        onClick={() => alert(`Modify role permissions for ${u.name}`)}
                      >
                        Roles
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<KeyRound className="w-4 h-4 text-amber-500" />}
                        onClick={() => alert(`Reset password link triggered for ${u.name}`)}
                      >
                        Reset
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </MainLayout>
  );
};
