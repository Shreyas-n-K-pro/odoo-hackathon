import React from 'react';

interface StatusBadgeProps {
  status: string;
  label?: string;
}

const statusConfig: Record<string, { bg: string; text: string; border: string }> = {
  available: { bg: 'bg-status-available', text: 'text-status-available_text', border: 'border-lime-500' },
  on_trip: { bg: 'bg-status-on_trip', text: 'text-status-on_trip_text', border: 'border-teal-500' },
  on_route: { bg: 'bg-status-on_trip', text: 'text-status-on_trip_text', border: 'border-teal-500' },
  maintenance: { bg: 'bg-status-maintenance', text: 'text-status-maintenance_text', border: 'border-amber-500' },
  suspended: { bg: 'bg-status-suspended', text: 'text-status-suspended_text', border: 'border-red-500' },
  completed: { bg: 'bg-status-completed', text: 'text-status-completed_text', border: 'border-lime-500' },
  cancelled: { bg: 'bg-status-cancelled', text: 'text-status-cancelled_text', border: 'border-red-500' },
  retired: { bg: 'bg-status-retired', text: 'text-status-retired_text', border: 'border-slate-400' },
  draft: { bg: 'bg-status-retired', text: 'text-status-retired_text', border: 'border-slate-400' },
  active: { bg: 'bg-status-available', text: 'text-status-available_text', border: 'border-lime-500' },
  inactive: { bg: 'bg-status-retired', text: 'text-status-retired_text', border: 'border-slate-400' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const config = statusConfig[status.toLowerCase()] || statusConfig['inactive'];
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold border ${config.border}`}>
      {displayLabel}
    </span>
  );
};
