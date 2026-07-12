import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../logo.avif';
import {
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  Wrench,
  Droplet,
  TrendingUp,
  FileText,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
  FolderOpen,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = user?.role || 'dispatcher';

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', show: true },
    
    // Vehicles: Admin, Fleet Manager, Dispatcher
    { label: 'Vehicles', icon: Truck, path: '/vehicles', show: ['admin', 'fleet_manager', 'dispatcher'].includes(role) },
    
    // Drivers: Admin, Fleet Manager, Dispatcher, Safety Officer
    { label: 'Drivers', icon: Users, path: '/drivers', show: ['admin', 'fleet_manager', 'dispatcher', 'safety_officer'].includes(role) },
    
    // Trips: Admin, Dispatcher
    { label: 'Trips', icon: MapPin, path: '/trips', show: ['admin', 'dispatcher'].includes(role) },
    
    // Safety Officer Pages: Compliance, Licenses, Documents
    { label: 'Compliance', icon: ShieldAlert, path: '/compliance', show: ['admin', 'safety_officer'].includes(role) },
    { label: 'Licenses', icon: ShieldCheck, path: '/licenses', show: ['admin', 'safety_officer'].includes(role) },
    { label: 'Documents', icon: FolderOpen, path: '/documents', show: ['admin', 'safety_officer'].includes(role) },
    
    // Maintenance: Admin, Fleet Manager
    { label: 'Maintenance', icon: Wrench, path: '/maintenance', show: ['admin', 'fleet_manager'].includes(role) },
    
    // Financial Analyst Pages: Fuel Logs, Expenses, Analytics (Fleet Intelligence)
    { label: 'Fuel Logs', icon: Droplet, path: '/fuel-logs', show: ['admin', 'financial_analyst'].includes(role) },
    { label: 'Expenses', icon: TrendingUp, path: '/expenses', show: ['admin', 'financial_analyst'].includes(role) },
    { label: 'Fleet Intelligence', icon: Zap, path: '/intelligence', show: ['admin', 'financial_analyst'].includes(role) },
    
    // Reports: Admin, Fleet Manager, Financial Analyst
    { label: 'Reports', icon: FileText, path: '/reports', show: ['admin', 'fleet_manager', 'financial_analyst'].includes(role) },
    
    // Admin specific pages: User Management, Audit Logs
    { label: 'User Management', icon: Users, path: '/user-management', show: role === 'admin' },
    { label: 'Audit Logs', icon: FileText, path: '/audit-logs', show: ['admin', 'fleet_manager', 'financial_analyst'].includes(role) },
    
    // General
    { label: 'Notifications', icon: Bell, path: '/notifications', show: true },
    { label: 'Settings', icon: Settings, path: '/settings', show: ['admin', 'fleet_manager'].includes(role) },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 w-64 bg-light-sidebar dark:bg-dark-sidebar
          border-r border-light-border dark:border-dark-border
          transform lg:transform-none transition-transform duration-300 z-50
          overflow-y-auto flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-light-border dark:border-dark-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logo} alt="TransitOps Logo" className="w-10 h-10 object-contain rounded-md" />
              <span className="font-bold text-lg text-teal-600">TransitOps</span>
            </div>
            <button onClick={onClose} className="lg:hidden text-light-secondary-text dark:text-dark-secondary-text">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-light-border dark:border-dark-border flex-shrink-0">
            <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text mb-1">Logged in as</p>
            <p className="font-semibold text-light-primary-text dark:text-dark-primary-text">{user.name}</p>
            <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text">{user.role.replace('_', ' ')}</p>
          </div>
        )}

        {/* Menu Items - Scrollable */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems
            .filter(item => item.show)
            .map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-light-secondary-text dark:text-dark-secondary-text hover:bg-light-divider dark:hover:bg-dark-card active:bg-teal-600 active:text-white transition-colors duration-200 text-left"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
        </nav>

        {/* Logout Button - Fixed at bottom */}
        <div className="p-4 border-t border-light-border dark:border-dark-border flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    html.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border z-40">
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-light-divider dark:hover:bg-dark-card rounded-lg"
        >
          <Menu className="w-6 h-6 text-light-primary-text dark:text-dark-primary-text" />
        </button>

        <div className="flex-1 flex items-center justify-center lg:justify-start gap-4 ml-4 lg:ml-0">
          <h1 className="text-xl font-bold text-teal-600 hidden lg:block">TransitOps</h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-light-divider dark:hover:bg-dark-card rounded-lg"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          {user && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-light-divider dark:bg-dark-card">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                {user.name.charAt(0)}
              </div>
              <span className="text-sm font-medium hidden sm:block">{user.name}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
