// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Maintenance Management Page (Screen 5)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { maintenanceApi } from '../api/maintenance.api'
import { vehicleApi } from '../api/vehicle.api'
import { usePermission } from '../hooks/usePermission'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'

const INITIAL_FORM = {
  vehicleId: '',
  type: 'Routine',
  cost: '',
  servicedAt: new Date().toISOString().split('T')[0],
  nextServiceAt: '',
  odometer: '',
  vendor: '',
  description: '',
}

export default function Maintenance() {
  const { canAccess } = usePermission()
  const canEdit = canAccess('maintenance', 'edit')

  const [logs, setLogs] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 })
  const [currentPage, setCurrentPage] = useState(1)

  const [form, setForm] = useState(INITIAL_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  // Filters state
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortBy, setSortBy] = useState('servicedAt')
  const [sortOrder, setSortOrder] = useState('desc')

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const res = await maintenanceApi.getAll({ 
        page, 
        limit: 10,
        search,
        type: filterType,
        status: filterStatus,
        sortBy,
        sortOrder
      })
      setLogs(res.data.data.logs)
      setPagination(res.data.data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search, filterType, filterStatus, sortBy, sortOrder])

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await vehicleApi.getAll({ limit: 100 })
      // Display only non-retired vehicles in the dropdown
      const activeVehicles = res.data.data.vehicles.filter(v => v.status !== 'Retired')
      setVehicles(activeVehicles)
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchLogs(currentPage)
  }, [fetchLogs, currentPage])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(prev => {
      const updated = { ...prev, [name]: value }
      // Auto-populate odometer if vehicle is selected
      if (name === 'vehicleId' && value) {
        const selectedVehicle = vehicles.find(v => v.id === Number(value))
        if (selectedVehicle) {
          updated.odometer = selectedVehicle.odometer
        }
      }
      return updated
    })
    if (formError) setFormError('')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')

    try {
      const payload = {
        ...form,
        vehicleId: Number(form.vehicleId),
        cost: parseFloat(form.cost),
        odometer: parseInt(form.odometer, 10),
      }

      await maintenanceApi.create(payload)
      setForm(INITIAL_FORM)
      fetchLogs(1)
      fetchVehicles() // Refresh vehicle status in dropdown list
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to log maintenance record.')
    } finally {
      setSaving(false)
    }
  }

  const handleCloseMaintenance = async (id) => {
    if (!window.confirm('Mark this maintenance service as Completed? This will return the vehicle to Available.')) return
    try {
      await maintenanceApi.close(id)
      fetchLogs(currentPage)
      fetchVehicles()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete maintenance.')
    }
  }

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      
      {/* ── Left Column: Log Service Record Form (lg:col-span-5) ───────────── */}
      <div className="lg:col-span-5 space-y-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Log Service Record</h2>
          
          <form onSubmit={handleSave} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Vehicle *</label>
              <select
                name="vehicleId"
                value={form.vehicleId}
                onChange={handleFormChange}
                className="input-field text-sm"
                required
                disabled={!canEdit}
              >
                <option value="">Select Vehicle</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.regNumber} — {v.name} ({v.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Service Type *</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleFormChange}
                  className="input-field text-sm"
                  disabled={!canEdit}
                >
                  <option value="Routine">Routine</option>
                  <option value="Repair">Repair</option>
                  <option value="Inspection">Inspection</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Cost (₹) *</label>
                <input
                  type="number"
                  name="cost"
                  value={form.cost}
                  onChange={handleFormChange}
                  placeholder="5000"
                  className="input-field text-sm"
                  required
                  min="1"
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Service Date *</label>
                <input
                  type="date"
                  name="servicedAt"
                  value={form.servicedAt}
                  onChange={handleFormChange}
                  className="input-field text-sm"
                  required
                  disabled={!canEdit}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Next Service Date</label>
                <input
                  type="date"
                  name="nextServiceAt"
                  value={form.nextServiceAt}
                  onChange={handleFormChange}
                  className="input-field text-sm"
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Odometer (km) *</label>
                <input
                  type="number"
                  name="odometer"
                  value={form.odometer}
                  onChange={handleFormChange}
                  placeholder="Odometer"
                  className="input-field text-sm"
                  required
                  min="0"
                  disabled={!canEdit}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Vendor Name</label>
                <input
                  type="text"
                  name="vendor"
                  value={form.vendor}
                  onChange={handleFormChange}
                  placeholder="e.g. Tata Service Center"
                  className="input-field text-sm"
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder="Details of repair or parts replaced..."
                rows="3"
                className="input-field text-sm"
                required
                disabled={!canEdit}
              />
            </div>

            {canEdit && (
              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full text-sm flex items-center justify-center gap-2 mt-2"
              >
                {saving ? <><Spinner size="sm" /> Saving...</> : 'Save Record'}
              </button>
            )}
          </form>
        </div>

        {/* ── Status flow visualization ────────────────────────────────────── */}
        <div className="glass-card p-5 space-y-3">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fleet Status Flow</h4>
          
          <div className="flex flex-col gap-2 font-mono text-xs">
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
              <span className="text-emerald-400 font-semibold">Available</span>
              <span className="text-gray-500">➔ (log active record) ➔</span>
              <span className="text-orange-400 font-semibold">In Shop</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
              <span className="text-orange-400 font-semibold">In Shop</span>
              <span className="text-gray-500">➔ (complete record) ➔</span>
              <span className="text-emerald-400 font-semibold">Available</span>
            </div>
          </div>
          
          <p className="text-[11px] text-gray-500 italic">
            * Note: In Shop vehicles are automatically removed from the dispatch pool.
          </p>
        </div>
      </div>

      {/* ── Right Column: Service Log Table (lg:col-span-7) ───────────────── */}
      <div className="lg:col-span-7">
        <div className="glass-card overflow-hidden h-full flex flex-col">
          <div className="p-4 border-b border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Service Log</h2>
              <span className="text-xs text-gray-400">Showing recent records</span>
            </div>
            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Search vehicle..."
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                className="input-field text-xs py-1.5 px-3 bg-black/40 border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <select
                value={filterType}
                onChange={e => { setFilterType(e.target.value); setCurrentPage(1); }}
                className="input-field text-xs py-1.5 px-3 bg-black/40 border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="Routine">Routine</option>
                <option value="Repair">Repair</option>
                <option value="Inspection">Inspection</option>
              </select>
              <select
                value={filterStatus}
                onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="input-field text-xs py-1.5 px-3 bg-black/40 border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active (In Shop)</option>
                <option value="Completed">Completed</option>
              </select>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={e => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                  setCurrentPage(1);
                }}
                className="input-field text-xs py-1.5 px-3 bg-black/40 border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="servicedAt-desc">Newest First</option>
                <option value="servicedAt-asc">Oldest First</option>
                <option value="cost-desc">Cost: High to Low</option>
                <option value="cost-asc">Cost: Low to High</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Service Type</th>
                  <th>Cost</th>
                  <th>Service Date</th>
                  <th>Status</th>
                  {canEdit && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: canEdit ? 6 : 5 }).map((_, j) => (
                        <td key={j}><div className="skeleton h-4 w-full rounded" /></td>
                      ))}
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={canEdit ? 6 : 5} className="text-center py-12 text-gray-500">
                      No maintenance records found.
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id}>
                      <td className="font-mono text-amber-400 font-medium">
                        {log.vehicle?.regNumber || `ID: ${log.vehicleId}`}
                      </td>
                      <td>
                        <span className="font-medium text-white block">{log.type}</span>
                        <span className="text-xs text-gray-500 block truncate max-w-[180px]" title={log.description}>
                          {log.description}
                        </span>
                      </td>
                      <td className="text-gray-300 font-semibold">
                        ₹{Number(log.cost).toLocaleString('en-IN')}
                      </td>
                      <td className="text-gray-400">
                        {new Date(log.servicedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td>
                        {/* Map Active to In_Shop styling to make it orange */}
                        <Badge status={log.status === 'Active' ? 'In_Shop' : 'Completed'} />
                      </td>
                      {canEdit && (
                        <td>
                          {log.status === 'Active' ? (
                            <button
                              onClick={() => handleCloseMaintenance(log.id)}
                              className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap"
                            >
                              Close Service
                            </button>
                          ) : (
                            <span className="text-xs text-gray-500 italic">Closed</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-white/5 flex items-center justify-end gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="text-xs text-gray-400 hover:text-white disabled:opacity-30 border border-white/10 px-2.5 py-1 rounded transition-colors"
              >
                ← Prev
              </button>
              <span className="text-xs text-gray-500">
                {currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, pagination.totalPages))}
                disabled={currentPage === pagination.totalPages}
                className="text-xs text-gray-400 hover:text-white disabled:opacity-30 border border-white/10 px-2.5 py-1 rounded transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
