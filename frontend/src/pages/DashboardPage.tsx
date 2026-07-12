import React, { useState, useEffect, useCallback } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { RefreshCw, Sun, Moon, Filter } from 'lucide-react';
// @ts-ignore
import { useAuth } from '../hooks/useAuth';

// ─── Types ────────────────────────────────────────────────────────────────────
interface KPIs {
  activeVehicles: number; availableVehicles: number;
  vehiclesInMaintenance: number; vehiclesOnTrip: number;
  activeTrips: number; pendingTrips: number; driversOnDuty: number;
  fleetUtilizationPct: number; totalFuelCost: number;
  maintenanceCost: number; totalOperationalCost: number;
  revenue: number; profit: number;
}
interface Trip {
  id: number; tripCode: string; origin: string; destination: string;
  status: string; distanceKm: number | null;
  vehicle: { name: string; regNumber: string };
  driver: { name: string };
}
interface StatusPt  { name: string; value: number; fill: string; }
interface MonthPt   { month: string; fuel?: number; trips?: number; }

const defaultKPIs: KPIs = {
  activeVehicles:0,availableVehicles:0,vehiclesInMaintenance:0,vehiclesOnTrip:0,
  activeTrips:0,pendingTrips:0,driversOnDuty:0,fleetUtilizationPct:0,
  totalFuelCost:0,maintenanceCost:0,totalOperationalCost:0,revenue:0,profit:0,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtInr = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${n.toFixed(0)}`;
};
const statusBadge = (s: string) => {
  const cls: Record<string,string> = {
    Completed:   'bg-green-500/20 text-green-400',
    In_Progress: 'bg-blue-500/20 text-blue-400',
    Scheduled:   'bg-amber-500/20 text-amber-400',
    Cancelled:   'bg-red-500/20 text-red-400',
  };
  const lbl: Record<string,string> = { Completed:'Completed', In_Progress:'In Progress', Scheduled:'Scheduled', Cancelled:'Cancelled' };
  return { cls: `inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${cls[s] ?? 'bg-gray-500/20 text-gray-400'}`, label: lbl[s] ?? s };
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const KPISkeleton = () => (
  <div className="glass-card p-4 space-y-2 animate-pulse">
    <div className="skeleton w-8 h-8 rounded" />
    <div className="skeleton w-16 h-6 rounded" />
    <div className="skeleton w-24 h-3 rounded" />
  </div>
);

const KPICard = ({ icon, value, label, color = 'text-white' }:
  { icon:string; value:string|number; label:string; color?:string }) => (
  <div className="glass-card p-4 transition-all duration-200 hover:shadow-amber-500/10 hover:shadow-lg hover:border-amber-500/20 border border-transparent">
    <p className="text-2xl mb-1">{icon}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    <p className="text-gray-400 text-xs mt-1">{label}</p>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export const DashboardPage: React.FC = () => {
  const { user, token } = useAuth() as { user: {name?:string;role?:string}|null; token:string|null };

  // ── State ──────────────────────────────────────────────────────────────────
  const [kpis,          setKpis]          = useState<KPIs>(defaultKPIs);
  const [trips,         setTrips]         = useState<Trip[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusPt[]>([]);
  const [monthlyFuel,   setMonthlyFuel]   = useState<MonthPt[]>([]);
  const [monthlyTrips,  setMonthlyTrips]  = useState<MonthPt[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [lastUpdated,   setLastUpdated]   = useState<Date|null>(null);

  // Filters (spec §3.2)
  const [filterType,   setFilterType]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [showFilters,  setShowFilters]  = useState(false);

  // Persist dark mode in localStorage
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('transitops-theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('transitops-theme', darkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('light-mode', !darkMode);
  }, [darkMode]);

  // ── Fetch all dashboard data ───────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!token) return;
    const h = { Authorization: `Bearer ${token}` };
    const params = new URLSearchParams();
    if (filterType)   params.set('type',   filterType);
    if (filterStatus) params.set('status', filterStatus);
    if (filterRegion) params.set('region', filterRegion);
    const q = params.toString() ? `?${params}` : '';

    try {
      const [kpisRes, tripsRes, statusRes, fuelRes, tripTrendRes] = await Promise.all([
        fetch(`/api/dashboard/kpis${q}`,                    { headers: h }),
        fetch('/api/dashboard/recent-trips',                 { headers: h }),
        fetch('/api/dashboard/vehicle-status-breakdown',     { headers: h }),
        fetch('/api/dashboard/monthly-fuel',                 { headers: h }),
        fetch('/api/dashboard/monthly-trips',                { headers: h }),
      ]);
      const [kj, tj, sj, fj, ttj] = await Promise.all([
        kpisRes.json(), tripsRes.json(), statusRes.json(), fuelRes.json(), tripTrendRes.json(),
      ]);
      if (kj.data)  setKpis(kj.data);
      if (tj.data)  setTrips(tj.data);
      if (sj.data)  setStatusBreakdown(sj.data);
      if (fj.data)  setMonthlyFuel(fj.data);
      if (ttj.data) setMonthlyTrips(ttj.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, filterType, filterStatus, filterRegion]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    const id = setInterval(fetchAll, 30000);

    return () => clearInterval(id);
  }, [fetchAll]);

  // ── KPI card definitions ───────────────────────────────────────────────────
  const kpiCards = [
    { icon:'🚛', value: kpis.activeVehicles,       label:'Active Vehicles',        color:'' },
    { icon:'✅', value: kpis.availableVehicles,     label:'Available',              color:'text-green-400' },
    { icon:'🔧', value: kpis.vehiclesInMaintenance, label:'In Maintenance',          color:'text-orange-400' },
    { icon:'🛣️', value: kpis.vehiclesOnTrip,         label:'On Trip',                color:'text-blue-400' },
    { icon:'📋', value: kpis.activeTrips,           label:'Active Trips',           color:'text-blue-400' },
    { icon:'📅', value: kpis.pendingTrips,          label:'Scheduled Trips',        color:'text-amber-400' },
    { icon:'👤', value: kpis.driversOnDuty,         label:'Drivers On Duty',        color:'' },
    { icon:'📊', value:`${kpis.fleetUtilizationPct}%`, label:'Fleet Utilization',  color:'text-amber-400' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.name ?? 'User'}! 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Live fleet overview
            {lastUpdated && (
              <span className="ml-2 text-gray-500 text-xs">
                · {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
              🟢 polls every 30s

            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(f => !f)}
            className={`btn-ghost flex items-center gap-2 px-3 py-2 text-sm ${showFilters ? 'border-amber-500/40 text-amber-400' : ''}`}
            title="Toggle filters">
            <Filter className="w-4 h-4" />
            Filters
            {(filterType || filterStatus || filterRegion) && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
          <button onClick={() => setDarkMode(d => !d)}
            className="btn-ghost p-2.5 rounded-lg text-gray-400 hover:text-white"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={fetchAll}
            className="btn-ghost flex items-center gap-2 px-3 py-2 text-sm"
            title="Refresh data">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Filter Bar (spec §3.2) ── */}
      {showFilters && (
        <div className="glass-card p-4 border border-amber-500/10">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Dashboard Filters
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Vehicle Type</label>
              <select value={filterType} onChange={e => setFilterType(e.target.value)}
                className="input-field">
                <option value="">All Types</option>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
                <option value="Mini">Mini</option>
                <option value="Bus">Bus</option>
                <option value="Pickup">Pickup</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Vehicle Status</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="input-field">
                <option value="">All Statuses</option>
                <option value="Available">Available</option>
                <option value="On_Trip">On Trip</option>
                <option value="In_Shop">In Maintenance</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Region</label>
              <input type="text" value={filterRegion}
                onChange={e => setFilterRegion(e.target.value)}
                placeholder="e.g. Mumbai"
                className="input-field" />
            </div>
            <div className="flex items-end">
              <button onClick={() => { setFilterType(''); setFilterStatus(''); setFilterRegion(''); }}
                className="btn-ghost text-sm px-3 py-2 w-full">
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 8 KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading
          ? Array.from({length:8}).map((_,i) => <KPISkeleton key={i} />)
          : kpiCards.map(k => <KPICard key={k.label} {...k} />)
        }
      </div>

      {/* ── Financial Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400 mb-1">⛽ Total Fuel Cost</p>
          <p className="text-xl font-bold text-white">{fmtInr(kpis.totalFuelCost)}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400 mb-1">🔧 Maintenance Cost</p>
          <p className="text-xl font-bold text-white">{fmtInr(kpis.maintenanceCost)}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400 mb-1">📈 Net Profit</p>
          <p className={`text-xl font-bold ${kpis.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {fmtInr(kpis.profit)}
          </p>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Status Pie */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold text-white mb-4">Vehicle Status Breakdown</h2>
          {statusBreakdown.filter(d => d.value > 0).length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusBreakdown.filter(d => d.value > 0)}
                  cx="50%" cy="50%" outerRadius={78} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {statusBreakdown.map((e,i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip formatter={(v:number) => [v, 'Vehicles']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-12">No vehicle data</p>
          )}
        </div>

        {/* Monthly Fuel Bar */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold text-white mb-4">Monthly Fuel Cost</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyFuel}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3766" />
              <XAxis dataKey="month" tick={{fill:'#9CA3AF', fontSize:11}} />
              <YAxis tick={{fill:'#9CA3AF', fontSize:11}} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v:number) => [`₹${v.toLocaleString('en-IN')}`, 'Fuel Cost']} />
              <Bar dataKey="fuel" fill="#F59E0B" radius={[4,4,0,0]} name="Fuel Cost (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Trips Trend ── */}
      <div className="glass-card p-5">
        <h2 className="text-base font-semibold text-white mb-4">Completed Trips Per Month</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthlyTrips}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E3766" />
            <XAxis dataKey="month" tick={{fill:'#9CA3AF', fontSize:12}} />
            <YAxis tick={{fill:'#9CA3AF', fontSize:12}} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="trips" stroke="#10B981" strokeWidth={2}
              dot={{fill:'#10B981', r:4}} activeDot={{r:6}} name="Trips Completed" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Recent Trips Table ── */}
      <div className="glass-card overflow-x-auto">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="text-base font-semibold text-white">Recent Trips</h2>
        </div>
        {trips.length > 0 ? (
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Trip Code</th>
                <th>Route</th>
                <th>Driver</th>
                <th>Vehicle</th>
                <th>Distance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {trips.map(trip => {
                const { cls, label } = statusBadge(trip.status);
                return (
                  <tr key={trip.id}>
                    <td className="font-mono text-amber-400 text-xs">{trip.tripCode}</td>
                    <td>
                      <p className="text-white text-sm font-medium">{trip.origin}</p>
                      <p className="text-gray-500 text-xs">→ {trip.destination}</p>
                    </td>
                    <td className="text-gray-300">{trip.driver?.name ?? '—'}</td>
                    <td className="text-gray-300 text-xs">{trip.vehicle?.regNumber ?? '—'}</td>
                    <td className="text-gray-400">{trip.distanceKm ? `${trip.distanceKm} km` : '—'}</td>
                    <td><span className={cls}>{label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-sm text-center py-12">
            {loading ? 'Loading…' : 'No trips yet. Create your first trip!'}
          </p>
        )}
      </div>
    </div>
  );
};
