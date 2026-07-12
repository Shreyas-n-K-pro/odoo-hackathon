// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Topbar
// Shows current page title and breadcrumb.
// ─────────────────────────────────────────────────────────────────────────────

import { useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import dayjs from 'dayjs'

const ROUTE_TITLES = {
  '/dashboard':   { title: 'Dashboard',       subtitle: 'Fleet overview at a glance' },
  '/vehicles':    { title: 'Vehicle Registry', subtitle: 'Manage your fleet of vehicles' },
  '/drivers':     { title: 'Driver Management', subtitle: 'Driver profiles and compliance' },
  '/trips':       { title: 'Trip Dispatcher',  subtitle: 'Schedule and track deliveries' },
  '/maintenance': { title: 'Maintenance Logs', subtitle: 'Service records and schedules' },
  '/fuel':        { title: 'Fuel & Expenses',  subtitle: 'Cost tracking and budgets' },
  '/analytics':   { title: 'Analytics',        subtitle: 'Performance insights and trends' },
  '/settings':    { title: 'Settings & RBAC',  subtitle: 'Depot configuration and permissions' },
}

export const Topbar = () => {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const info = ROUTE_TITLES[pathname] || { title: 'TransitOps', subtitle: '' }
  const now = dayjs().format('ddd, D MMM YYYY')

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-navy-950/80 backdrop-blur-md sticky top-0 z-10">
      <div>
        <h1 className="text-white font-semibold text-lg leading-none">{info.title}</h1>
        <p className="text-gray-500 text-xs mt-0.5">{info.subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-gray-500 text-sm hidden sm:block">{now}</span>
        <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
          <span className="text-amber-400 text-sm font-semibold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>
      </div>
    </header>
  )
}
