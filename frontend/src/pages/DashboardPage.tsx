import React from 'react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { MainLayout } from '../layouts/MainLayout';
import { Card, KPICard } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { getMockKPIs, getSmartDispatchRecommendation, getOperationalInsights, mockTrips } from '../services/mockData';
import { formatCurrency } from '../utils/helpers';
import { AlertCircle, TrendingUp, Zap, AlertTriangle } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const kpis = getMockKPIs();
  const dispatch = getSmartDispatchRecommendation('Mumbai');
  const insights = getOperationalInsights();
  const vehicleStatusData = [
    { name: 'Available', value: kpis.availableVehicles, fill: '#1F7A43' },
    { name: 'On Trip', value: kpis.vehiclesOnTrip, fill: '#006D86' },
    { name: 'Maintenance', value: kpis.vehiclesInMaintenance, fill: '#B57600' },
  ];

  const monthlyFuelData = [
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

  return (
    <MainLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-light-primary-text dark:text-dark-primary-text mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-light-secondary-text dark:text-dark-secondary-text">
          Here's your fleet overview for today
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="Total Vehicles" value={kpis.totalVehicles} icon="🚚" />
        <KPICard title="Available" value={kpis.availableVehicles} icon="✓" trend="up" trendValue="+1" />
        <KPICard title="Active Trips" value={kpis.activeTrips} icon="🚛" />
        <KPICard title="Drivers On Duty" value={kpis.driversOnDuty} icon="👤" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="Fleet Utilization" value={`${kpis.fleetUtilization.toFixed(1)}%`} icon="📊" trend="up" trendValue="+5%" />
        <KPICard title="Total Fuel Cost" value={formatCurrency(kpis.totalFuelCost)} icon="⛽" />
        <KPICard title="Revenue" value={formatCurrency(kpis.revenue)} icon="💰" trend="up" trendValue="+12%" />
        <KPICard title="Profit" value={formatCurrency(kpis.profit)} icon="📈" />
      </div>

      {/* Smart Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Smart Dispatch Recommendation */}
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-light-primary-text dark:text-dark-primary-text">
              Smart Dispatch
            </h2>
            <Zap className="w-5 h-5 text-lime-500" />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text uppercase tracking-wide mb-1">Recommended Vehicle</p>
              <p className="font-semibold text-teal-600">{dispatch.vehicleName}</p>
            </div>
            <div>
              <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text uppercase tracking-wide mb-1">Recommended Driver</p>
              <p className="font-semibold text-teal-600">{dispatch.driverName}</p>
            </div>
            <div>
              <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text uppercase tracking-wide mb-2">Match Score</p>
              <div className="w-full bg-light-divider dark:bg-dark-card rounded-full h-2">
                <div className="bg-gradient-to-r from-teal-500 to-aqua-500 h-2 rounded-full" style={{width: `${dispatch.score}%`}}></div>
              </div>
              <p className="text-sm font-semibold text-center mt-1">{dispatch.score}%</p>
            </div>
            <div className="pt-2 border-t border-light-border dark:border-dark-border">
              <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text uppercase tracking-wide mb-2">Why?</p>
              {dispatch.reasons.slice(0, 2).map((reason, i) => (
                <p key={i} className="text-xs text-light-secondary-text dark:text-dark-secondary-text mb-1">✓ {reason}</p>
              ))}
            </div>
          </div>
        </Card>

        {/* Fleet Health Score */}
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-light-primary-text dark:text-dark-primary-text">
              Fleet Health
            </h2>
            <AlertCircle className="w-5 h-5 text-lime-500" />
          </div>
          <div className="text-center py-4">
            <div className="text-5xl font-bold text-lime-500 mb-2">91</div>
            <p className="text-light-secondary-text dark:text-dark-secondary-text text-sm mb-4">/100</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-light-secondary-text dark:text-dark-secondary-text">
                <span>Maintenance</span>
                <span>95%</span>
              </div>
              <div className="flex justify-between text-light-secondary-text dark:text-dark-secondary-text">
                <span>Fuel Efficiency</span>
                <span>88%</span>
              </div>
              <div className="flex justify-between text-light-secondary-text dark:text-dark-secondary-text">
                <span>Breakdowns</span>
                <span>92%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Operational Insights */}
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-light-primary-text dark:text-dark-primary-text">
              Insights
            </h2>
            <TrendingUp className="w-5 h-5 text-teal-600" />
          </div>
          <div className="space-y-3">
            {insights.slice(0, 3).map((insight, i) => (
              <div key={i} className="pb-2 border-b border-light-border dark:border-dark-border last:border-0">
                <p className="text-xs font-semibold text-light-primary-text dark:text-dark-primary-text">
                  {insight.icon} {insight.title}
                </p>
                <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text mt-1">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Vehicle Status */}
        <Card>
          <h2 className="text-lg font-bold text-light-primary-text dark:text-dark-primary-text mb-4">Vehicle Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={vehicleStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, value}) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {vehicleStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Monthly Fuel Cost */}
        <Card>
          <h2 className="text-lg font-bold text-light-primary-text dark:text-dark-primary-text mb-4">Monthly Fuel Cost</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyFuelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Bar dataKey="fuel" fill="#0F766E" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Trips Chart */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card>
          <h2 className="text-lg font-bold text-light-primary-text dark:text-dark-primary-text mb-4">Trips Per Month</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tripData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="trips" stroke="#0F766E" strokeWidth={2} dot={{fill: '#0F766E'}} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Trips & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trips */}
        <Card>
          <h2 className="text-lg font-bold text-light-primary-text dark:text-dark-primary-text mb-4">Recent Trips</h2>
          <div className="space-y-3">
            {mockTrips.slice(0, 3).map((trip) => (
              <div key={trip.id} className="pb-3 border-b border-light-border dark:border-dark-border last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-light-primary-text dark:text-dark-primary-text">
                    {trip.source} → {trip.destination}
                  </p>
                  <StatusBadge status={trip.status} />
                </div>
                <p className="text-xs text-light-secondary-text dark:text-dark-secondary-text">
                  {trip.plannedDistance}km • {formatCurrency(trip.revenue)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Alerts */}
        <Card>
          <h2 className="text-lg font-bold text-light-primary-text dark:text-dark-primary-text mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Alerts & Notifications
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="font-semibold text-xs text-yellow-900 dark:text-yellow-300">License Expiry Alert</p>
              <p className="text-xs text-yellow-800 dark:text-yellow-300 mt-1">Driver Akshay's license expires in 4 days</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="font-semibold text-xs text-blue-900 dark:text-blue-300">Maintenance Due</p>
              <p className="text-xs text-blue-800 dark:text-blue-300 mt-1">Vehicle 15 due for service in 600 km</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="font-semibold text-xs text-green-900 dark:text-green-300">Trip Completed</p>
              <p className="text-xs text-green-800 dark:text-green-300 mt-1">Mumbai → Pune trip completed successfully</p>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};
