import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Download, AlertTriangle, FileText } from 'lucide-react';
// @ts-ignore
import { useAuth } from '../hooks/useAuth';
// @ts-ignore
import { exportAnalyticsPDF } from '../utils/pdfExport';


interface ROIData {
  vehicleId: number;
  regNumber: string;
  name: string;
  revenue: number;
  fuelCost: number;
  maintenanceCost: number;
  acquisitionCost: number;
  roi: number;
}

interface CostData {
  id: number;
  regNumber: string;
  name: string;
  totalCost: number;
  fuelCost: number;
  maintenanceCost: number;
}

export const ReportsPage: React.FC = () => {
  const { token } = useAuth() as { token: string | null };
  
  const [activeTab, setActiveTab] = useState<'roi' | 'cost' | 'revenue'>('roi');
  const [loading, setLoading] = useState(true);
  const [roiData, setRoiData] = useState<{ fleetAvgRoi: number; vehicles: ROIData[] }>({ fleetAvgRoi: 0, vehicles: [] });
  const [costData, setCostData] = useState<CostData[]>([]);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number; trips: number }[]>([]);
  const [efficiencyData, setEfficiencyData] = useState({ avgEfficiency: 0, totalDistance: 0, totalLitres: 0 });
  const [utilizationData, setUtilizationData] = useState({ fleetUtilizationPct: 0 });

  const fetchMetrics = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${token}` };

      const [roiRes, costRes, revRes, effRes, sumRes] = await Promise.all([
        fetch('/api/analytics/roi', { headers }),
        fetch('/api/analytics/top-costliest-vehicles', { headers }),
        fetch('/api/analytics/monthly-revenue', { headers }),
        fetch('/api/analytics/fuel-efficiency', { headers }),
        fetch('/api/analytics/summary', { headers })
      ]);

      const roiJson = await roiRes.json();
      const costJson = await costRes.json();
      const revJson = await revRes.json();
      const effJson = await effRes.json();
      const sumJson = await sumRes.json();

      if (roiJson.data) setRoiData(roiJson.data);
      if (costJson.data) setCostData(costJson.data);
      if (revJson.data) setRevenueData(revJson.data);
      if (effJson.data) setEfficiencyData(effJson.data);
      if (sumJson.data) setUtilizationData({ fleetUtilizationPct: sumJson.data.fleetUtilizationPct });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [token]);

  const handleExportCSV = () => {
    if (!token) return;
    const url = `/api/analytics/export?reportType=${activeTab}`;
    // Fetch with authentication token and download blob
    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${activeTab}_report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
      })
      .catch(err => console.error('Export failed:', err));
  };

  return (
    <div className="p-4 md:p-6 animate-fade-in space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Analytics 📊</h1>
          <p className="text-gray-400 text-sm mt-1">Live metrics, operational costs, and vehicle ROI calculators</p>
        </div>
        
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => exportAnalyticsPDF(roiData, costData, efficiencyData, utilizationData)}
            disabled={loading}
            className="btn-ghost flex items-center justify-center gap-2 px-3 py-2 text-sm text-amber-400 border-amber-500/30 hover:border-amber-500/60 disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={handleExportCSV}
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-2xl mb-1">⛽</p>
          <p className="text-xl font-bold text-white">{efficiencyData.avgEfficiency} km/l</p>
          <p className="text-gray-400 text-xs mt-1">Avg Fuel Efficiency</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl mb-1">📊</p>
          <p className="text-xl font-bold text-white">{utilizationData.fleetUtilizationPct}%</p>
          <p className="text-gray-400 text-xs mt-1">Fleet Utilization</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl mb-1">💸</p>
          <p className="text-xl font-bold text-white">
            ₹{costData.reduce((sum, item) => sum + item.totalCost, 0).toLocaleString('en-IN')}
          </p>
          <p className="text-gray-400 text-xs mt-1">Total Operational Cost</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl mb-1">📈</p>
          <p className="text-xl font-bold text-white">{roiData.fleetAvgRoi}%</p>
          <p className="text-gray-400 text-xs mt-1">Fleet Average ROI</p>
        </div>
      </div>

      {/* Formula Note */}
      <div className="p-3 bg-navy-900/50 rounded-lg border border-white/5 flex items-center gap-2 text-gray-400 text-xs">
        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <span>
          <strong>ROI Formula:</strong> ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost. Estimated Revenue is calculated at flat ₹100 per km traveled.
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setActiveTab('roi')}
          className={`py-2.5 px-4 font-semibold text-sm transition-colors relative ${
            activeTab === 'roi' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          Vehicle ROI
        </button>
        <button
          onClick={() => setActiveTab('cost')}
          className={`py-2.5 px-4 font-semibold text-sm transition-colors relative ${
            activeTab === 'cost' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          Operational Cost Breakdown
        </button>
        <button
          onClick={() => setActiveTab('revenue')}
          className={`py-2.5 px-4 font-semibold text-sm transition-colors relative ${
            activeTab === 'revenue' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          Monthly Revenue Trends
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="glass-card p-12 text-center text-gray-400">Loading metrics...</div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'roi' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ROI Table */}
              <div className="glass-card p-5 overflow-x-auto">
                <h3 className="text-base font-semibold text-white mb-4">Vehicle ROI Breakdown</h3>
                <table className="w-full data-table">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-semibold uppercase text-gray-400 pb-2">Vehicle</th>
                      <th className="text-right text-xs font-semibold uppercase text-gray-400 pb-2">Revenue (₹)</th>
                      <th className="text-right text-xs font-semibold uppercase text-gray-400 pb-2">Cost (₹)</th>
                      <th className="text-right text-xs font-semibold uppercase text-gray-400 pb-2">ROI (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roiData.vehicles.map((v) => (
                      <tr key={v.vehicleId} className="border-t border-white/5">
                        <td className="py-2.5">
                          <p className="font-semibold text-white text-sm">{v.name}</p>
                          <p className="text-xs text-gray-500">{v.regNumber}</p>
                        </td>
                        <td className="text-right py-2.5 text-sm text-green-400">₹{v.revenue.toLocaleString('en-IN')}</td>
                        <td className="text-right py-2.5 text-sm text-gray-400">₹{(v.fuelCost + v.maintenanceCost).toLocaleString('en-IN')}</td>
                        <td className={`text-right py-2.5 text-sm font-bold ${v.roi >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                          {v.roi}%
                        </td>
                      </tr>
                    ))}
                    {roiData.vehicles.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-gray-500 text-sm">No vehicles found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ROI Bar Chart */}
              <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-white mb-4">ROI % per Vehicle</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={roiData.vehicles}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E3766" />
                    <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} label={{ value: 'ROI %', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
                    <ChartTooltip formatter={(v: number) => `${v}%`} />
                    <Bar dataKey="roi" fill="#10B981" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'cost' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Costliest vehicles bar chart */}
              <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-white mb-4">Fuel vs Maintenance Cost</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={costData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E3766" />
                    <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                    <ChartTooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                    <Legend />
                    <Bar dataKey="fuelCost" stackId="a" fill="#F59E0B" name="Fuel Cost" />
                    <Bar dataKey="maintenanceCost" stackId="a" fill="#EF4444" name="Maintenance" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Cost Table */}
              <div className="glass-card p-5 overflow-x-auto">
                <h3 className="text-base font-semibold text-white mb-4">Cost Breakdown</h3>
                <table className="w-full data-table">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-semibold uppercase text-gray-400 pb-2">Vehicle</th>
                      <th className="text-right text-xs font-semibold uppercase text-gray-400 pb-2">Fuel (₹)</th>
                      <th className="text-right text-xs font-semibold uppercase text-gray-400 pb-2">Maintenance (₹)</th>
                      <th className="text-right text-xs font-semibold uppercase text-gray-400 pb-2">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costData.map((v) => (
                      <tr key={v.id} className="border-t border-white/5">
                        <td className="py-2.5">
                          <p className="font-semibold text-white text-sm">{v.name}</p>
                          <p className="text-xs text-gray-500">{v.regNumber}</p>
                        </td>
                        <td className="text-right py-2.5 text-sm text-gray-300">₹{v.fuelCost.toLocaleString('en-IN')}</td>
                        <td className="text-right py-2.5 text-sm text-gray-300">₹{v.maintenanceCost.toLocaleString('en-IN')}</td>
                        <td className="text-right py-2.5 text-sm font-bold text-white">₹{v.totalCost.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                    {costData.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-gray-500 text-sm">No cost logs recorded.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="glass-card p-5">
              <h3 className="text-base font-semibold text-white mb-4">Monthly Revenue Trends</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E3766" />
                  <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <ChartTooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={2} name="Revenue (₹)" />
                  <Line type="monotone" dataKey="trips" stroke="#10B981" strokeWidth={2} name="Trips Completed" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
