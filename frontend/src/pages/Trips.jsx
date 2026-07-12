import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  getTrips, createTrip, updateTrip, deleteTrip,
  dispatchTrip, completeTrip, cancelTrip
} from '../api/trips.api';
import { getDrivers } from '../api/drivers.api';
import { vehicleApi } from '../api/vehicle.api';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { AuthContext } from '../context/AuthContext';
import { usePermission } from '../hooks/usePermission';
import dayjs from 'dayjs';

// ─── Role-based permissions helper ────────────────────────────────────────────
// Dispatcher: full CRUD  |  Fleet Manager: view only  |  Safety Officer: view only
const ROLE_ACTIONS = {
  Dispatcher:        { canCreate: true,  canEdit: true,  canDelete: true,  canDispatch: true,  canComplete: true,  canCancel: true  },
  Fleet_Manager:     { canCreate: false, canEdit: false, canDelete: false, canDispatch: false, canComplete: false, canCancel: false },
  Safety_Officer:    { canCreate: false, canEdit: false, canDelete: false, canDispatch: false, canComplete: false, canCancel: false },
  Financial_Analyst: { canCreate: false, canEdit: false, canDelete: false, canDispatch: false, canComplete: false, canCancel: false },
};

const EMPTY_FORM = { vehicleId: '', driverId: '', origin: '', destination: '', scheduledAt: '', cargoWeight: '', notes: '' };
const EMPTY_COMPLETE = { tripId: null, distanceKm: '', fuelLitres: '', fuelPricePerLtr: '', expenseCategory: '', expenseAmount: '', expenseDescription: '' };

// ─── Status filter tabs ───────────────────────────────────────────────────────
const STATUS_TABS = ['All', 'Scheduled', 'In_Progress', 'Completed', 'Cancelled'];

export default function Trips() {
  const { user } = useContext(AuthContext);
  const { canAccess } = usePermission();

  const role = user?.role || '';
  const perms = ROLE_ACTIONS[role] || ROLE_ACTIONS.Fleet_Manager;
  const canEdit = canAccess('trips', 'edit');

  // ── State ────────────────────────────────────────────────────────────────
  const [trips, setTrips]           = useState([]);
  const [vehicles, setVehicles]     = useState([]);
  const [drivers, setDrivers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab]   = useState('All');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Modals
  const [createModalOpen, setCreateModalOpen]   = useState(false);
  const [editModalOpen, setEditModalOpen]       = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [editingTrip, setEditingTrip]           = useState(null);

  // Form state
  const [formData, setFormData]       = useState(EMPTY_FORM);
  const [editData, setEditData]       = useState(EMPTY_FORM);
  const [completeData, setCompleteData] = useState(EMPTY_COMPLETE);
  const [formError, setFormError]     = useState('');
  const [submitting, setSubmitting]   = useState(false);

  // ── Fetch all data ────────────────────────────────────────────────────────
  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        getTrips(),
        vehicleApi.getAll({ status: 'Available' }),
        getDrivers({ status: 'Available' }),
      ]);

      setTrips(tripsRes);
      setVehicles(vehiclesRes.data?.data?.vehicles || []);
      setDrivers(driversRes);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Trips fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => { fetchData(false); }, [fetchData]);

  // ── Auto-poll every 15 seconds so all roles see live updates ──────────────
  useEffect(() => {
    const interval = setInterval(() => fetchData(true), 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── Filtered trips by tab ─────────────────────────────────────────────────
  const filteredTrips = activeTab === 'All'
    ? trips
    : trips.filter(t => t.status === activeTab);

  // ── Validation for create/edit ────────────────────────────────────────────
  const getSelectedVehicle = (id) => vehicles.find(v => v.id === parseInt(id));
  const isCargoValid = (fd) => {
    const v = getSelectedVehicle(fd.vehicleId);
    return !v || !fd.cargoWeight || parseFloat(fd.cargoWeight) <= parseFloat(v.capacityKg);
  };
  const isFormValid = (fd) =>
    fd.vehicleId && fd.driverId && fd.origin && fd.destination && fd.scheduledAt && isCargoValid(fd);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isFormValid(formData)) return;
    setSubmitting(true); setFormError('');
    try {
      await createTrip({
        ...formData,
        vehicleId: parseInt(formData.vehicleId),
        driverId: parseInt(formData.driverId),
        cargoWeight: formData.cargoWeight ? parseFloat(formData.cargoWeight) : undefined,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
      });
      setCreateModalOpen(false);
      setFormData(EMPTY_FORM);
      fetchData(true);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create trip.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (trip) => {
    setEditingTrip(trip);
    setEditData({
      vehicleId: trip.vehicleId,
      driverId: trip.driverId,
      origin: trip.origin,
      destination: trip.destination,
      scheduledAt: dayjs(trip.scheduledAt).format('YYYY-MM-DDTHH:mm'),
      cargoWeight: trip.cargoWeight || '',
      notes: trip.notes || '',
    });
    setFormError('');
    setEditModalOpen(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editingTrip) return;
    setSubmitting(true); setFormError('');
    try {
      await updateTrip(editingTrip.id, {
        ...editData,
        vehicleId: parseInt(editData.vehicleId),
        driverId: parseInt(editData.driverId),
        cargoWeight: editData.cargoWeight ? parseFloat(editData.cargoWeight) : undefined,
        scheduledAt: new Date(editData.scheduledAt).toISOString(),
      });
      setEditModalOpen(false);
      fetchData(true);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update trip.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (trip) => {
    if (!window.confirm(`Delete trip ${trip.tripCode}? This cannot be undone.`)) return;
    try {
      await deleteTrip(trip.id);
      fetchData(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete trip.');
    }
  };

  const handleDispatch = async (trip) => {
    if (!window.confirm(`Dispatch trip ${trip.tripCode}?`)) return;
    try {
      await dispatchTrip(trip.id);
      fetchData(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to dispatch trip.');
    }
  };

  const handleCancel = async (trip) => {
    if (!window.confirm(`Cancel trip ${trip.tripCode}?`)) return;
    try {
      await cancelTrip(trip.id);
      fetchData(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel trip.');
    }
  };

  const openComplete = (trip) => {
    setCompleteData({ ...EMPTY_COMPLETE, tripId: trip.id });
    setCompleteModalOpen(true);
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setSubmitting(true); setFormError('');
    try {
      await completeTrip(completeData.tripId, {
        distanceKm: parseFloat(completeData.distanceKm),
        fuelLitres: completeData.fuelLitres ? parseFloat(completeData.fuelLitres) : undefined,
        fuelPricePerLtr: completeData.fuelPricePerLtr ? parseFloat(completeData.fuelPricePerLtr) : undefined,
        expenseCategory: completeData.expenseCategory || undefined,
        expenseAmount: completeData.expenseAmount ? parseFloat(completeData.expenseAmount) : undefined,
        expenseDescription: completeData.expenseDescription || undefined,
      });
      setCompleteModalOpen(false);
      fetchData(true);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to complete trip.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total:      trips.length,
    scheduled:  trips.filter(t => t.status === 'Scheduled').length,
    inProgress: trips.filter(t => t.status === 'In_Progress').length,
    completed:  trips.filter(t => t.status === 'Completed').length,
  };

  // ── Render helpers ────────────────────────────────────────────────────────
  const inputClass = 'input-field';
  const labelClass = 'block text-xs font-medium text-gray-400 mb-1';


  const TripForm = ({ fd, setFd, onSubmit, title, submitLabel }) => {
    const sv = getSelectedVehicle(fd.vehicleId);
    const cargoOk = isCargoValid(fd);
    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Vehicle (Available)</label>
            <select required className={inputClass} value={fd.vehicleId}
              onChange={e => setFd({ ...fd, vehicleId: e.target.value })}>
              <option value="">Select vehicle…</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} · {v.regNumber} · {v.capacityKg}kg
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Driver (Available)</label>
            <select required className={inputClass} value={fd.driverId}
              onChange={e => setFd({ ...fd, driverId: e.target.value })}>
              <option value="">Select driver…</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name} · {d.region || 'N/A'}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Origin</label>
            <input required type="text" className={inputClass} placeholder="e.g. Warehouse A"
              value={fd.origin} onChange={e => setFd({ ...fd, origin: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Destination</label>
            <input required type="text" className={inputClass} placeholder="e.g. Central Hub"
              value={fd.destination} onChange={e => setFd({ ...fd, destination: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Scheduled At</label>
            <input required type="datetime-local" className={inputClass}
              value={fd.scheduledAt} onChange={e => setFd({ ...fd, scheduledAt: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>
              Cargo Weight (kg){sv && <span className="text-gray-500 ml-1">max {sv.capacityKg}kg</span>}
            </label>
            <input type="number" step="0.1" min="0"
              className={`${inputClass} ${!cargoOk ? 'border-red-500' : ''}`}
              value={fd.cargoWeight} onChange={e => setFd({ ...fd, cargoWeight: e.target.value })} />
            {!cargoOk && <p className="text-red-400 text-xs mt-1">Exceeds vehicle capacity ({sv?.capacityKg}kg)</p>}
          </div>
        </div>
        <div>
          <label className={labelClass}>Notes (optional)</label>
          <textarea rows={2} className={`${inputClass} resize-none`} placeholder="Additional notes…"
            value={fd.notes} onChange={e => setFd({ ...fd, notes: e.target.value })} />
        </div>
        {formError && <p className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2">{formError}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => { setCreateModalOpen(false); setEditModalOpen(false); setFormError(''); }}
            className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">Cancel</button>
          <button type="submit" disabled={!isFormValid(fd) || submitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm rounded-lg transition-colors flex items-center gap-2">
            {submitting && <Spinner size="sm" />}
            {submitLabel}
          </button>
        </div>
      </form>
    );
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-gray-400 text-sm">Loading trips…</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trip Dispatcher</h1>
          <p className="text-gray-400 text-sm mt-0.5 flex items-center gap-2">
            {role.replace('_', ' ')} view
            {lastUpdated && (
              <span className="text-gray-600 text-xs">
                · refreshed {dayjs(lastUpdated).format('h:mm:ss A')}
              </span>
            )}
            {refreshing && <span className="text-blue-400 text-xs animate-pulse">· syncing…</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchData(true)} disabled={refreshing}
            className="px-3 py-2 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors flex items-center gap-2">
            <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          {canEdit && perms.canCreate && (
            <button onClick={() => { setFormData(EMPTY_FORM); setFormError(''); setCreateModalOpen(true); }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Trip
            </button>
          )}
        </div>
      </div>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Trips',  value: stats.total,      color: 'text-white',       bg: 'bg-white/5' },
          { label: 'Scheduled',    value: stats.scheduled,  color: 'text-blue-400',    bg: 'bg-blue-500/10' },
          { label: 'In Progress',  value: stats.inProgress, color: 'text-amber-400',   bg: 'bg-amber-500/10' },
          { label: 'Completed',    value: stats.completed,  color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} border border-white/5 rounded-xl p-4`}>
            <p className="text-xs text-gray-400">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit">
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}>
            {tab === 'In_Progress' ? 'In Progress' : tab}
            {tab !== 'All' && (
              <span className="ml-1.5 text-xs opacity-70">
                {trips.filter(t => t.status === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Trip</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Route</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Schedule</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Vehicle</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Driver</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Cargo</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              {canEdit && <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredTrips.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 8 : 7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-500">
                    <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm">No {activeTab === 'All' ? '' : activeTab.replace('_', ' ')} trips found</p>
                    {canEdit && perms.canCreate && activeTab === 'All' && (
                      <button onClick={() => { setFormData(EMPTY_FORM); setCreateModalOpen(true); }}
                        className="text-blue-400 hover:text-blue-300 text-sm underline">Create your first trip</button>
                    )}
                  </div>
                </td>
              </tr>
            ) : filteredTrips.map(trip => (
              <tr key={trip.id} className="border-b border-white/5 hover:bg-white/3 transition-colors group">
                <td className="px-4 py-3">
                  <span className="font-mono text-sm text-white">{trip.tripCode}</span>
                  {trip.notes && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[100px]" title={trip.notes}>{trip.notes}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="text-white text-sm">{trip.origin}</p>
                  <p className="text-gray-500 text-xs flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    {trip.destination}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-white text-sm">{dayjs(trip.scheduledAt).format('MMM D, YYYY')}</p>
                  <p className="text-gray-500 text-xs">{dayjs(trip.scheduledAt).format('h:mm A')}</p>
                  {trip.completedAt && (
                    <p className="text-emerald-500 text-xs">Done {dayjs(trip.completedAt).format('MMM D')}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="text-white text-sm">{trip.vehicle?.name || '—'}</p>
                  <p className="text-gray-500 text-xs">{trip.vehicle?.regNumber || ''}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-white text-sm">{trip.driver?.name || '—'}</p>
                  <p className="text-gray-500 text-xs">{trip.driver?.region || ''}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-white text-sm">{trip.cargoWeight ? `${trip.cargoWeight} kg` : '—'}</p>
                  {trip.distanceKm && (
                    <p className="text-gray-500 text-xs">{trip.distanceKm} km</p>
                  )}
                </td>
                <td className="px-4 py-3"><Badge status={trip.status} /></td>
                {canEdit && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {/* Edit — only Scheduled */}
                      {trip.status === 'Scheduled' && perms.canEdit && (
                        <button onClick={() => openEdit(trip)}
                          className="px-2 py-1 text-xs text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 rounded transition-colors">
                          Edit
                        </button>
                      )}
                      {/* Dispatch — only Scheduled */}
                      {trip.status === 'Scheduled' && perms.canDispatch && (
                        <button onClick={() => handleDispatch(trip)}
                          className="px-2 py-1 text-xs text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded transition-colors">
                          Dispatch
                        </button>
                      )}
                      {/* Cancel — Scheduled */}
                      {trip.status === 'Scheduled' && perms.canCancel && (
                        <button onClick={() => handleCancel(trip)}
                          className="px-2 py-1 text-xs text-orange-400 hover:text-orange-300 hover:bg-orange-400/10 rounded transition-colors">
                          Cancel
                        </button>
                      )}
                      {/* Delete — Scheduled only */}
                      {trip.status === 'Scheduled' && perms.canDelete && (
                        <button onClick={() => handleDelete(trip)}
                          className="px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors">
                          Delete
                        </button>
                      )}
                      {/* Complete — In_Progress */}
                      {trip.status === 'In_Progress' && perms.canComplete && (
                        <button onClick={() => openComplete(trip)}
                          className="px-2 py-1 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors">
                          Complete
                        </button>
                      )}
                      {/* Cancel — In_Progress */}
                      {trip.status === 'In_Progress' && perms.canCancel && (
                        <button onClick={() => handleCancel(trip)}
                          className="px-2 py-1 text-xs text-orange-400 hover:text-orange-300 hover:bg-orange-400/10 rounded transition-colors">
                          Cancel
                        </button>
                      )}
                      {(trip.status === 'Completed' || trip.status === 'Cancelled') && (
                        <span className="text-xs text-gray-600 italic">—</span>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer count */}
        <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing {filteredTrips.length} of {trips.length} trip{trips.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-gray-600">Auto-refreshes every 15 seconds</p>
        </div>
      </div>

      {/* ── View-only notice for read roles ──────────────────────────────── */}
      {!canEdit && (
        <div className="flex items-center gap-3 bg-blue-900/20 border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-blue-300">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          You have <strong className="mx-1">view-only</strong> access to trips as a {role.replace('_', ' ')}.
          Contact a Dispatcher to make changes.
        </div>
      )}

      {/* ── Create Modal ─────────────────────────────────────────────────── */}
      <Modal isOpen={createModalOpen} onClose={() => { setCreateModalOpen(false); setFormError(''); }} title="Create New Trip" size="lg">
        <TripForm fd={formData} setFd={setFormData} onSubmit={handleCreate} title="Create Trip" submitLabel="Create Trip" />
      </Modal>

      {/* ── Edit Modal ───────────────────────────────────────────────────── */}
      <Modal isOpen={editModalOpen} onClose={() => { setEditModalOpen(false); setFormError(''); }} title={`Edit Trip — ${editingTrip?.tripCode}`} size="lg">
        <TripForm fd={editData} setFd={setEditData} onSubmit={handleEdit} title="Edit Trip" submitLabel="Save Changes" />
      </Modal>

      {/* ── Complete Modal ───────────────────────────────────────────────── */}
      <Modal isOpen={completeModalOpen} onClose={() => { setCompleteModalOpen(false); setFormError(''); }} title="Complete Trip" size="lg">
        <form onSubmit={handleComplete} className="space-y-4">
          <div>
            <label className={labelClass}>Distance Driven (km) <span className="text-red-400">*</span></label>
            <input required type="number" step="0.1" min="0" className={inputClass} placeholder="e.g. 120.5"
              value={completeData.distanceKm}
              onChange={e => setCompleteData({ ...completeData, distanceKm: e.target.value })} />
          </div>

          <div className="border-t border-white/10 pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Optional Fuel Log</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Litres</label>
                <input type="number" step="0.1" min="0" className={inputClass} placeholder="e.g. 45.5"
                  value={completeData.fuelLitres}
                  onChange={e => setCompleteData({ ...completeData, fuelLitres: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Price / Ltr (₹)</label>
                <input type="number" step="0.01" min="0" className={inputClass} placeholder="e.g. 95.00"
                  value={completeData.fuelPricePerLtr}
                  onChange={e => setCompleteData({ ...completeData, fuelPricePerLtr: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Optional Expense</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Category</label>
                <select className={inputClass} value={completeData.expenseCategory}
                  onChange={e => setCompleteData({ ...completeData, expenseCategory: e.target.value })}>
                  <option value="">None</option>
                  <option value="Toll">Toll</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Amount (₹)</label>
                <input type="number" step="0.01" min="0" className={inputClass} placeholder="e.g. 250"
                  value={completeData.expenseAmount}
                  onChange={e => setCompleteData({ ...completeData, expenseAmount: e.target.value })} />
              </div>
            </div>
            <div className="mt-3">
              <label className={labelClass}>Description</label>
              <input type="text" className={inputClass} placeholder="e.g. NH-48 Toll"
                value={completeData.expenseDescription}
                onChange={e => setCompleteData({ ...completeData, expenseDescription: e.target.value })} />
            </div>
          </div>

          {formError && <p className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCompleteModalOpen(false)}
              className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">Cancel</button>
            <button type="submit" disabled={!completeData.distanceKm || submitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm rounded-lg transition-colors flex items-center gap-2">
              {submitting && <Spinner size="sm" />}
              Mark as Completed
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
