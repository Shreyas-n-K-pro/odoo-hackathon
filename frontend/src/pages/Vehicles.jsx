// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Vehicle Registry Page (Screen 2)
// Features: stat cards, filter bar (type/status/search), data table with
// status badges, Add Vehicle modal, pagination.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react'
import { vehicleApi } from '../api/vehicle.api'
import { usePermission } from '../hooks/usePermission'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Spinner } from '../components/ui/Spinner'
import { exportVehiclesPDF } from '../utils/pdfExport'


// Debounce hook
const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

const INITIAL_FORM = {
  regNumber: '', name: '', type: 'Van',
  capacityKg: '', odometer: 0, acquisitionCost: '', region: '',
}

export default function Vehicles() {
  const { canAccess } = usePermission()
  const canEdit = canAccess('fleet', 'edit')

  // ── State ─────────────────────────────────────────────────────────────────
  const [vehicles, setVehicles]   = useState([])
  const [stats, setStats]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 })

  const [filters, setFilters] = useState({ type: '', status: '', search: '' })
  const debouncedSearch = useDebounce(filters.search)

  const [modalOpen, setModalOpen]   = useState(false)
  const [editVehicle, setEditVehicle] = useState(null)
  const [form, setForm]             = useState(INITIAL_FORM)
  const [formError, setFormError]   = useState('')
  const [saving, setSaving]         = useState(false)

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchVehicles = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const [vRes, sRes] = await Promise.all([
        vehicleApi.getAll({ ...filters, search: debouncedSearch, page, limit: 10 }),
        vehicleApi.getStats(),
      ])
      setVehicles(vRes.data.data.vehicles)
      setPagination(vRes.data.data.pagination)
      setStats(sRes.data.data)
    } catch {
      // Error handled by axios interceptor
    } finally {
      setLoading(false)
    }
  }, [filters, debouncedSearch])

  useEffect(() => { fetchVehicles(1) }, [fetchVehicles])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openAddModal = () => {
    setEditVehicle(null)
    setForm(INITIAL_FORM)
    setFormError('')
    setModalOpen(true)
  }

  const openEditModal = (vehicle) => {
    setEditVehicle(vehicle)
    setForm({
      regNumber:      vehicle.regNumber,
      name:           vehicle.name,
      type:           vehicle.type,
      capacityKg:     vehicle.capacityKg,
      odometer:       vehicle.odometer,
      acquisitionCost: vehicle.acquisitionCost,
      region:         vehicle.region || '',
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (formError) setFormError('')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')

    try {
      const payload = {
        ...form,
        capacityKg:      parseFloat(form.capacityKg),
        odometer:        parseInt(form.odometer, 10),
        acquisitionCost: parseFloat(form.acquisitionCost),
      }

      if (editVehicle) {
        await vehicleApi.update(editVehicle.id, payload)
      } else {
        await vehicleApi.create(payload)
      }

      setModalOpen(false)
      fetchVehicles(1)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save vehicle.'
      setFormError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleRetire = async (id) => {
    if (!window.confirm('Mark this vehicle as Retired? This cannot be undone easily.')) return
    try {
      await vehicleApi.retire(id)
      fetchVehicles(pagination.page)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to retire vehicle.')
    }
  }

  const formatCurrency = (val) =>
    `₹${Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

  return (
    <div className="p-6 space-y-6 animate-fade-in">

      {/* ── Stat Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Fleet',  value: stats?.total,     color: 'text-white' },
          { label: 'Available',    value: stats?.available,  color: 'text-emerald-400' },
          { label: 'On Trip',      value: stats?.onTrip,     color: 'text-blue-400' },
          { label: 'In Shop',      value: stats?.inShop,     color: 'text-orange-400' },
          { label: 'Retired',      value: stats?.retired,    color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-4">
            <p className="text-gray-400 text-xs font-medium">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>
              {value ?? <span className="skeleton w-8 h-6 inline-block rounded" />}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filter Bar + Add Button ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3">
          {/* Type filter */}
          <select
            value={filters.type}
            onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
            className="input-field w-auto py-2 text-sm"
            id="filter-type"
          >
            <option value="">Type: All</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
            <option value="Mini">Mini</option>
          </select>

          {/* Status filter */}
          <select
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            className="input-field w-auto py-2 text-sm"
            id="filter-status"
          >
            <option value="">Status: All</option>
            <option value="Available">Available</option>
            <option value="On_Trip">On Trip</option>
            <option value="In_Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              placeholder="Search reg no..."
              className="input-field pl-9 py-2 text-sm w-48"
              id="search-vehicle"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportVehiclesPDF(vehicles)}
            className="btn-ghost flex items-center gap-2 px-3 py-2 text-sm text-amber-400 border-amber-500/30 hover:border-amber-500/60"
            title="Export fleet to PDF">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
          {canEdit && (
            <button onClick={openAddModal} className="btn-primary flex items-center gap-2 text-sm" id="add-vehicle-btn">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Vehicle
            </button>
          )}
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Reg. No.</th>
                <th>Name / Model</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Odometer</th>
                <th>Acq. Cost</th>
                <th>Status</th>
                {canEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: canEdit ? 8 : 7 }).map((_, j) => (
                      <td key={j}><div className="skeleton h-4 w-full rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 8 : 7} className="text-center py-12 text-gray-500">
                    No vehicles found. {canEdit && 'Click "+ Add Vehicle" to get started.'}
                  </td>
                </tr>
              ) : (
                vehicles.map(v => (
                  <tr key={v.id}>
                    <td className="font-mono text-amber-400 font-medium">{v.regNumber}</td>
                    <td className="font-medium text-white">{v.name}</td>
                    <td className="text-gray-400">{v.type}</td>
                    <td className="text-gray-400">{v.capacityKg} kg</td>
                    <td className="text-gray-400">{Number(v.odometer).toLocaleString()} km</td>
                    <td className="text-gray-400">{formatCurrency(v.acquisitionCost)}</td>
                    <td><Badge status={v.status} /></td>
                    {canEdit && (
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(v)}
                            className="text-xs text-gray-400 hover:text-white border border-white/10 hover:border-white/30 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          {v.status !== 'Retired' && (
                            <button
                              onClick={() => handleRetire(v.id)}
                              className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              Retire
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
          <p className="text-xs text-gray-500 italic">
            Rule: Registration No. must be unique · Retired/In Shop vehicles are hidden from Trip Dispatcher
          </p>
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchVehicles(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="text-xs text-gray-400 hover:text-white disabled:opacity-30 border border-white/10 px-2.5 py-1 rounded transition-colors"
              >
                ← Prev
              </button>
              <span className="text-xs text-gray-500">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchVehicles(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="text-xs text-gray-400 hover:text-white disabled:opacity-30 border border-white/10 px-2.5 py-1 rounded transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ──────────────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editVehicle ? 'Edit Vehicle' : 'Add Vehicle to Fleet'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Reg. Number *</label>
              <input name="regNumber" value={form.regNumber} onChange={handleFormChange}
                placeholder="e.g. VAN-15" className="input-field text-sm" required
                disabled={!!editVehicle} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Name / Model *</label>
              <input name="name" value={form.name} onChange={handleFormChange}
                placeholder="e.g. Tata Ace Gold" className="input-field text-sm" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Type *</label>
              <select name="type" value={form.type} onChange={handleFormChange} className="input-field text-sm">
                <option value="Van">Van</option>
                <option value="Truck">Truck</option>
                <option value="Mini">Mini</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Capacity (kg) *</label>
              <input name="capacityKg" type="number" value={form.capacityKg} onChange={handleFormChange}
                placeholder="750" className="input-field text-sm" required min="1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Odometer (km)</label>
              <input name="odometer" type="number" value={form.odometer} onChange={handleFormChange}
                placeholder="0" className="input-field text-sm" min="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Acquisition Cost (₹) *</label>
              <input name="acquisitionCost" type="number" value={form.acquisitionCost} onChange={handleFormChange}
                placeholder="550000" className="input-field text-sm" required min="1" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Region</label>
            <input name="region" value={form.region} onChange={handleFormChange}
              placeholder="e.g. North Zone" className="input-field text-sm" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost flex-1 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
              {saving ? <><Spinner size="sm" /> Saving...</> : (editVehicle ? 'Update Vehicle' : 'Add to Fleet')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
