// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Sidebar Navigation
// Role-filtered nav: each role only sees its permitted modules.
// ─────────────────────────────────────────────────────────────────────────────

import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { usePermission } from '../../hooks/usePermission'

const NAV_ITEMS = [
  { to: '/dashboard',   label: 'Dashboard',    module: 'dashboard',   icon: GridIcon },
  { to: '/vehicles',    label: 'Fleet',         module: 'fleet',       icon: TruckIcon },
  { to: '/drivers',     label: 'Drivers',       module: 'drivers',     icon: UsersIcon },
  { to: '/trips',       label: 'Trips',         module: 'trips',       icon: MapIcon },
  { to: '/maintenance', label: 'Maintenance',   module: 'maintenance', icon: WrenchIcon },
  { to: '/fuel',        label: 'Fuel & Expenses', module: 'fuel',      icon: FuelIcon },
  { to: '/analytics',   label: 'Analytics',    module: 'analytics',   icon: ChartIcon },
  { to: '/settings',    label: 'Settings',      module: 'settings',    icon: SettingsIcon },
]

const ROLE_DISPLAY = {
  Fleet_Manager:     'Fleet Manager',
  Dispatcher:        'Dispatcher',
  Safety_Officer:    'Safety Officer',
  Financial_Analyst: 'Financial Analyst',
}

export const Sidebar = () => {
  const { user, logout } = useAuth()
  const { canAccess } = usePermission()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-navy-900 border-r border-white/5 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
            <TruckIcon className="w-5 h-5 text-navy-950" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">TransitOps</h1>
            <p className="text-gray-500 text-xs mt-0.5">Fleet Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
          Navigation
        </p>
        {NAV_ITEMS.filter(item => canAccess(item.module, 'view')).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive
                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-400' : ''}`} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 mb-2">
          <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-amber-400 text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-gray-500 text-xs truncate">{ROLE_DISPLAY[user?.role] || user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                     text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
        >
          <LogoutIcon className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}

// ── Inline SVG Icons ──────────────────────────────────────────────────────────
const iconProps = { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

function GridIcon({ className }) {
  return <svg className={className} {...iconProps}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
}
function TruckIcon({ className }) {
  return <svg className={className} {...iconProps}><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
}
function UsersIcon({ className }) {
  return <svg className={className} {...iconProps}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function MapIcon({ className }) {
  return <svg className={className} {...iconProps}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
}
function WrenchIcon({ className }) {
  return <svg className={className} {...iconProps}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
}
function FuelIcon({ className }) {
  return <svg className={className} {...iconProps}><path d="M4 4h10v16H4z"/><path d="M14 8h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4"/><path d="M8 4v4"/></svg>
}
function ChartIcon({ className }) {
  return <svg className={className} {...iconProps}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
}
function SettingsIcon({ className }) {
  return <svg className={className} {...iconProps}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
}
function LogoutIcon({ className }) {
  return <svg className={className} {...iconProps}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
}
