import { UserRole } from '../types';

export const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    admin: 'Super Admin',
    fleet_manager: 'Fleet Manager',
    dispatcher: 'Dispatcher',
    safety_officer: 'Safety Officer',
    financial_analyst: 'Financial Analyst',
  };
  return labels[role];
};

export const getStatusColor = (status: string) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    available: { bg: 'bg-status-available', text: 'text-status-available_text', border: 'border-lime-500' },
    on_trip: { bg: 'bg-status-on_trip', text: 'text-status-on_trip_text', border: 'border-teal-500' },
    on_route: { bg: 'bg-status-on_trip', text: 'text-status-on_trip_text', border: 'border-teal-500' },
    maintenance: { bg: 'bg-status-maintenance', text: 'text-status-maintenance_text', border: 'border-amber-500' },
    suspended: { bg: 'bg-status-suspended', text: 'text-status-suspended_text', border: 'border-red-500' },
    completed: { bg: 'bg-status-completed', text: 'text-status-completed_text', border: 'border-lime-500' },
    cancelled: { bg: 'bg-status-cancelled', text: 'text-status-cancelled_text', border: 'border-red-500' },
    retired: { bg: 'bg-status-retired', text: 'text-status-retired_text', border: 'border-gray-400' },
    draft: { bg: 'bg-status-retired', text: 'text-status-retired_text', border: 'border-gray-400' },
    active: { bg: 'bg-status-available', text: 'text-status-available_text', border: 'border-lime-500' },
    inactive: { bg: 'bg-status-retired', text: 'text-status-retired_text', border: 'border-gray-400' },
  };
  return colors[status] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-400' };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getRoleDashboardPath = (role: UserRole): string => {
  return `/dashboard?role=${role}`;
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
