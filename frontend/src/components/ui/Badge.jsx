// ─── Badge Component ───────────────────────────────────────────────────────
// Renders color-coded status badges for vehicles, drivers, and trips.

const STATUS_STYLES = {
  // ── Vehicle ──────────────────────────────────────────────────────────────
  Available:   'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  On_Trip:     'bg-blue-500/15    text-blue-400    border border-blue-500/20',
  In_Shop:     'bg-orange-500/15  text-orange-400  border border-orange-500/20',
  Retired:     'bg-red-500/15     text-red-400     border border-red-500/20',

  // ── Driver ───────────────────────────────────────────────────────────────
  Off_Duty:    'bg-gray-500/15    text-gray-400    border border-gray-500/20',
  Suspended:   'bg-red-500/20     text-red-400     border border-red-500/30',
  Inactive:    'bg-gray-500/15    text-gray-400    border border-gray-500/20',

  // ── Trip ─────────────────────────────────────────────────────────────────
  Scheduled:   'bg-blue-500/15    text-blue-400    border border-blue-500/20',
  In_Progress: 'bg-amber-500/15   text-amber-400   border border-amber-500/20',
  Completed:   'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  Cancelled:   'bg-red-500/15     text-red-400     border border-red-500/20',
  Maintenance_Active: 'bg-orange-500/15  text-orange-400  border border-orange-500/20',
};

const STATUS_DOTS = {
  Available:   'bg-emerald-400',
  On_Trip:     'bg-blue-400',
  In_Shop:     'bg-orange-400',
  Retired:     'bg-red-400',
  Off_Duty:    'bg-gray-400',
  Suspended:   'bg-red-500',
  Inactive:    'bg-gray-400',
  On_Leave:    'bg-orange-400',
  Scheduled:   'bg-blue-400',
  In_Progress: 'bg-amber-400',
  Completed:   'bg-emerald-400',
  Cancelled:   'bg-red-400',
};

// Human-readable labels
const STATUS_LABELS = {
  On_Trip:     'On Trip',
  In_Shop:     'In Shop',
  Off_Duty:    'Off Duty',
  Suspended:   'Suspended',
  On_Leave:    'On Leave',
  In_Progress: 'In Progress',
};

export const Badge = ({ status, className = '' }) => {
  const style = STATUS_STYLES[status] ?? 'bg-gray-500/15 text-gray-400 border border-gray-500/20';
  const dot   = STATUS_DOTS[status]   ?? 'bg-gray-400';
  const label = STATUS_LABELS[status] ?? status ?? '—';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {label}
    </span>
  );
};
