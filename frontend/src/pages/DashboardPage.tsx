import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';
// @ts-ignore
import { useAuth } from '../hooks/useAuth';

const COLORS = {
  available:   '#10B981',
  onTrip:      '#3B82F6',
  maintenance: '#F97316',
};

const kpiData = [
  { label: 'Total Vehicles',   value: 12,   icon: '🚚' },
  { label: 'Available',        value: 7,    icon: '✅' },
  { label: 'Active Trips',     value: 4,    icon: '🛣️'  },
  { label: 'Drivers On Duty',  value: 9,    icon: '👤' },
];

const vehicleStatusData = [
  { name: 'Available',    value: 7,  fill: COLORS.available },
  { name: 'On Trip',      value: 4,  fill: COLORS.onTrip },
  { name: 'Maintenance',  value: 1,  fill: COLORS.maintenance },
];

const monthlyFuelData = [
  { month: 'Jan', fuel: 210000 },
  { month: 'Feb', fuel: 185000 },
  { month: 'Mar', fuel: 230000 },
  { month: 'Apr', fuel: 197000 },
  { month: 'May', fuel: 245000 },
  { month: 'Jun', fuel: 285000 },
  { month: 'Jul', fuel: 312000 },
];

const tripData = [
  { month: 'Jan', trips: 45 },
  { month: 'Feb', trips: 52 },
  { month: 'Mar', trips: 48 },
  { month: 'Apr', trips: 61 },
  { month: 'May', trips: 55 },
  { month: 'Jun', trips: 67 },
];

const recentTrips = [
  { id: 1, route: 'Mumbai → Pune',     status: 'Completed', km: 148, revenue: '₹12,400' },
  { id: 2, route: 'Pune → Nashik',     status: 'In Transit', km: 212, revenue: '₹18,700' },
  { id: 3, route: 'Mumbai → Nagpur',   status: 'Scheduled', km: 830, revenue: '₹65,200' },
];

const alerts = [
  { type: 'warning', title: 'License Expiry',   msg: "Driver Akshay's license expires in 4 days" },
  { type: 'info',    title: 'Maintenance Due',   msg: 'Vehicle MH04-T1234 due for service in 600 km' },
  { type: 'success', title: 'Trip Completed',    msg: 'Mumbai → Pune completed successfully' },
];

const alertColors: Record<string, string> = {
  warning: 'border-amber-500/30 bg-amber-500/5 text-amber-300',
  info:    'border-blue-500/30 bg-blue-500/5 text-blue-300',
  success: 'border-green-500/30 bg-green-500/5 text-green-300',
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    'Completed':  'bg-green-500/20 text-green-300',
    'In Transit': 'bg-blue-500/20 text-blue-300',
    'Scheduled':  'bg-amber-500/20 text-amber-300',
    'Cancelled':  'bg-red-500/20 text-red-300',
  };
  return `inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-gray-500/20 text-gray-300'}`;
};

export const DashboardPage: React.FC = () => {
  const { user } = useAuth() as { user: { name?: string; role?: string } | null };

  return (
    <div className="p-4 md:p-6 animate-fade-in space-y-6">

      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.name ?? 'User'}! 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">Here's your fleet overview for today</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
          <div key={kpi.label} className="glass-card p-4">
            <p className="text-2xl mb-1">{kpi.icon}</p>
            <p className="text-2xl font-bold text-white">{kpi.value}</p>
            <p className="text-gray-400 text-xs mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Second row KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-2xl mb-1">📊</p>
          <p className="text-2xl font-bold text-amber-400">58.3%</p>
          <p className="text-gray-400 text-xs mt-1">Fleet Utilization</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl mb-1">⛽</p>
          <p className="text-2xl font-bold text-white">₹3.12L</p>
          <p className="text-gray-400 text-xs mt-1">Fuel Cost (Jul)</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl mb-1">💰</p>
          <p className="text-2xl font-bold text-green-400">₹9.6L</p>
          <p className="text-gray-400 text-xs mt-1">Revenue (Jul)</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl mb-1">📈</p>
          <p className="text-2xl font-bold text-white">₹6.48L</p>
          <p className="text-gray-400 text-xs mt-1">Profit (Jul)</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Status Pie */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold text-white mb-4">Vehicle Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={vehicleStatusData}
                cx="50%" cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {vehicleStatusData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Fuel Cost Bar */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold text-white mb-4">Monthly Fuel Cost</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyFuelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3766" />
              <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
              <Bar dataKey="fuel" fill="#F59E0B" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trips Line Chart */}
      <div className="glass-card p-5">
        <h2 className="text-base font-semibold text-white mb-4">Trips Per Month</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={tripData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E3766" />
            <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="trips" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Trips & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trips */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold text-white mb-4">Recent Trips</h2>
          <div className="divide-y divide-white/5">
            {recentTrips.map((trip) => (
              <div key={trip.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{trip.route}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{trip.km} km · {trip.revenue}</p>
                </div>
                <span className={statusBadge(trip.status)}>{trip.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold text-white mb-4">⚠️ Alerts & Notifications</h2>
          <div className="space-y-3">
            {alerts.map((a, i) => (
              <div key={i} className={`p-3 rounded-lg border ${alertColors[a.type]}`}>
                <p className="text-xs font-semibold">{a.title}</p>
                <p className="text-xs mt-0.5 opacity-80">{a.msg}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
