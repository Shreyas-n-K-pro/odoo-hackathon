// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Driver Management Page
// Features: CRUD, license expiry warnings (red row + banner), safety score bar,
//           license category, Suspended status, email notification trigger.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { getDrivers, createDriver, updateDriver, triggerExpiryChecks } from '../api/drivers.api';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import dayjs from 'dayjs';
import { exportDriversPDF } from '../utils/pdfExport';


const EMPTY_FORM = {
  name: '', licenseNumber: '', licenseCategory: 'LMV',
  licenseExpiry: '', phone: '', email: '',
  status: 'Available', region: '', safetyScore: 100,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const daysUntilExpiry = (expiry) => {
  if (!expiry) return null;
  return dayjs(expiry).diff(dayjs(), 'day');
};

const ExpiryBadge = ({ expiry }) => {
  const days = daysUntilExpiry(expiry);
  if (days === null) return null;
  if (days < 0)      return <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold">EXPIRED {Math.abs(days)}d ago</span>;
  if (days === 0)    return <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold">EXPIRES TODAY</span>;
  if (days <= 30)    return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold">Expires in {days}d</span>;
  return null;
};

const SafetyBar = ({ score = 0 }) => {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-semibold ${pct >= 80 ? 'text-green-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
        {pct}
      </span>
    </div>
  );
};

export default function Drivers() {
  const [drivers, setDrivers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search,  setSearch]    = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen]       = useState(false);
  const [formData, setFormData]         = useState(EMPTY_FORM);
  const [editingId, setEditingId]       = useState(null);
  const [formError, setFormError]       = useState('');
  const [saving, setSaving]             = useState(false);
  const [checkingExp, setCheckingExp]   = useState(false);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const data = await getDrivers();
      setDrivers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrivers(); }, []);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setFormError('');
    try {
      const payload = {
        ...formData,
        email: formData.email || null,
        safetyScore: Number(formData.safetyScore),
      };
      if (editingId) {
        await updateDriver(editingId, payload);
      } else {
        await createDriver(payload);
      }
      setModalOpen(false);
      fetchDrivers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save driver.';
      const details = err.response?.data?.details?.map(d => `${d.field}: ${d.message}`).join('\n') || '';
      setFormError(`${msg}${details ? `\n${details}` : ''}`);
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    setFormData(EMPTY_FORM); setEditingId(null); setFormError('');
    setModalOpen(true);
  };
  const openEdit = (d) => {
    setFormData({
      name:            d.name,
      licenseNumber:   d.licenseNumber,
      licenseCategory: d.licenseCategory || 'LMV',
      licenseExpiry:   dayjs(d.licenseExpiry).format('YYYY-MM-DD'),
      phone:           d.phone,
      email:           d.email || '',
      status:          d.status,
      region:          d.region || '',
      safetyScore:     d.safetyScore ?? 100,
    });
    setEditingId(d.id); setFormError('');
    setModalOpen(true);
  };

  const handleExpiry = async () => {
    setCheckingExp(true);
    try {
      const res = await triggerExpiryChecks();
      alert(`License check done!\n${res.count} expiring/expired license(s) found.\nNotifications sent to drivers + Safety Officer.`);
    } catch {
      alert('Failed — verify Brevo configuration in .env');
    } finally {
      setCheckingExp(false);
    }
  };

  // ── Filtered list ─────────────────────────────────────────────────────────
  const visible = drivers.filter(d => {
    const matchSearch = !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Expiry summary for banner
  const expiredCount  = drivers.filter(d => daysUntilExpiry(d.licenseExpiry) !== null && daysUntilExpiry(d.licenseExpiry) < 0).length;

  const expiringCount = drivers.filter(d => {
    const days = daysUntilExpiry(d.licenseExpiry);
    return days !== null && days >= 0 && days <= 30;
  }).length;

  if (loading) return (
    <div className="flex h-full items-center justify-center min-h-[400px]">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Driver Management</h1>
          <p className="text-gray-400 text-sm mt-1">{drivers.length} drivers registered</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExpiry} disabled={checkingExp}
            className="btn-ghost flex items-center gap-2 px-3 py-2 text-sm text-amber-400 border-amber-500/30 hover:border-amber-500/60 disabled:opacity-50">
            🔔 {checkingExp ? 'Checking…' : 'Check License Expiry'}
          </button>
          <button
            onClick={() => exportDriversPDF(visible)}
            className="btn-ghost flex items-center gap-2 px-3 py-2 text-sm text-amber-400 border-amber-500/30 hover:border-amber-500/60"
            title="Export visible drivers to PDF">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            + Add Driver
          </button>

        </div>
      </div>

      {/* ── Expiry Alerts Banner ── */}
      {(expiredCount > 0 || expiringCount > 0) && (
        <div className="alert-danger flex items-start gap-3">
          <span className="text-xl flex-shrink-0">⚠️</span>
          <div>
            {expiredCount > 0 && (
              <p className="font-semibold">
                {expiredCount} driver license{expiredCount > 1 ? 's' : ''} have <strong>expired</strong> — these drivers are blocked from dispatch.
              </p>
            )}
            {expiringCount > 0 && (
              <p className="mt-0.5">
                {expiringCount} license{expiringCount > 1 ? 's' : ''} expiring within 30 days. Click "Check License Expiry" to send alerts.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Total Drivers',   value: drivers.length,                                  color:'text-white',       icon:'👤' },
          { label:'Available',       value: drivers.filter(d=>d.status==='Available').length, color:'text-green-400',   icon:'✅' },
          { label:'On Trip',         value: drivers.filter(d=>d.status==='On_Trip').length,   color:'text-blue-400',    icon:'🛣️' },
          { label:'Suspended / Off', value: drivers.filter(d=>d.status==='Suspended'||d.status==='Off_Duty').length, color:'text-red-400', icon:'🚫' },
        ].map(c => (
          <div key={c.label} className="glass-card p-4">
            <p className="text-xl mb-1">{c.icon}</p>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-gray-400 text-xs mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input type="search" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or license number…"
          className="input-field flex-1" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="input-field sm:w-44">
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="On_Trip">On Trip</option>
          <option value="Off_Duty">Off Duty</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className="glass-card overflow-x-auto">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>Driver</th>
              <th>License</th>
              <th>Expiry</th>
              <th>Safety Score</th>
              <th>Region</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 py-10">
                  {search || filterStatus ? 'No drivers match your filters.' : 'No drivers registered.'}
                </td>
              </tr>
            )}
            {visible.map(d => {
              const days = daysUntilExpiry(d.licenseExpiry);
              const isExpired   = days !== null && days < 0;
              const isExpiring  = days !== null && days >= 0 && days <= 30;
              const isSuspended = d.status === 'Suspended';
              const rowHighlight = isExpired || isSuspended
                ? 'bg-red-500/5 border-l-2 border-l-red-500'
                : isExpiring ? 'bg-amber-500/5 border-l-2 border-l-amber-500' : '';
              return (
                <tr key={d.id} className={`hover:bg-white/[0.02] ${rowHighlight}`}>
                  <td>
                    <p className="font-semibold text-white">{d.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{d.phone}</p>
                    {d.email && <p className="text-xs text-blue-400">{d.email}</p>}
                  </td>
                  <td>
                    <p className="font-mono text-sm text-gray-300">{d.licenseNumber}</p>
                    <p className="text-xs text-gray-500">{d.licenseCategory || '—'}</p>
                  </td>
                  <td>
                    <p className={`text-sm ${isExpired ? 'text-red-400 font-semibold' : 'text-gray-300'}`}>
                      {d.licenseExpiry ? dayjs(d.licenseExpiry).format('DD MMM YYYY') : '—'}
                    </p>
                    <ExpiryBadge expiry={d.licenseExpiry} />
                  </td>
                  <td><SafetyBar score={d.safetyScore} /></td>
                  <td className="text-gray-400 text-sm">{d.region || '—'}</td>
                  <td>
                    <Badge status={
                      d.status === 'Available' ? 'Available' :
                      d.status === 'On_Trip'   ? 'On_Trip'   :
                      d.status === 'Suspended' ? 'Suspended' :
                      d.status === 'Off_Duty'  ? 'Off_Duty'  : d.status
                    } />
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(d)}
                        className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 px-2 py-1 rounded transition-colors">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/5 text-xs text-gray-500">
          Showing {visible.length} of {drivers.length} drivers
        </div>
      </div>

      {/* ── Modal ── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Driver' : 'Add New Driver'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Full Name *</label>
            <input required type="text" className="input-field"
              placeholder="e.g. Arjun Sharma"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Email (for notifications)</label>
            <input type="email" className="input-field"
              placeholder="driver@transitops.in"
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          {/* License Number + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">License Number *</label>
              <input required type="text" className="input-field"
                placeholder="e.g. MH-04-20191234"
                value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">License Category</label>
              <select className="input-field" value={formData.licenseCategory}
                onChange={e => setFormData({...formData, licenseCategory: e.target.value})}>
                <option value="LMV">LMV (Light Motor Vehicle)</option>
                <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                <option value="HPMV">HPMV (Heavy Passenger)</option>
                <option value="MGV">MGV (Medium Goods)</option>
                <option value="HGV">HGV (Heavy Goods)</option>
                <option value="TRANS">Transport</option>
              </select>
            </div>
          </div>

          {/* Expiry + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">License Expiry Date *</label>
              <input required type="date" className="input-field"
                value={formData.licenseExpiry} onChange={e => setFormData({...formData, licenseExpiry: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Phone *</label>
              <input required type="tel" className="input-field"
                placeholder="+91 98765 43210"
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>

          {/* Status + Region */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
              <select className="input-field" value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Available">Available</option>
                <option value="On_Trip">On Trip</option>
                <option value="Off_Duty">Off Duty</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Region</label>
              <input type="text" className="input-field"
                placeholder="e.g. Mumbai"
                value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} />
            </div>
          </div>

          {/* Safety Score */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Safety Score: <span className={`font-bold ${formData.safetyScore >= 80 ? 'text-green-400' : formData.safetyScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {formData.safetyScore}
              </span>
            </label>
            <input type="range" min="0" max="100" step="1"
              className="w-full accent-amber-500 cursor-pointer"
              value={formData.safetyScore}
              onChange={e => setFormData({...formData, safetyScore: Number(e.target.value)})} />
            <div className="flex justify-between text-xs text-gray-500 mt-0.5">
              <span>0 — Poor</span><span>50 — Fair</span><span>100 — Excellent</span>
            </div>
          </div>

          {formError && (
            <div className="alert-danger text-sm whitespace-pre-wrap">{formError}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="btn-ghost px-4 py-2 text-sm">Cancel</button>
            <button type="submit" disabled={saving}
              className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
              {saving && <Spinner size="sm" />}
              {editingId ? 'Save Changes' : 'Add Driver'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
