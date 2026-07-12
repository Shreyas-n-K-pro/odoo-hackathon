// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Fuel & Expense Management Page (Screen 6)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { fuelApi } from '../api/fuel.api'
import { vehicleApi } from '../api/vehicle.api'
import { usePermission } from '../hooks/usePermission'
import { Modal } from '../components/ui/Modal'
import { Spinner } from '../components/ui/Spinner'
import axiosInstance from '../api/axiosInstance'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

const INITIAL_FUEL_FORM = {
  vehicleId: '',
  tripId: '',
  liters: '',
  cost: '',
  odometer: '',
  station: '',
  logDate: new Date().toISOString().split('T')[0],
}

const INITIAL_EXPENSE_FORM = {
  vehicleId: '',
  tripId: '',
  toll: '',
  other: '',
  maintenanceLinked: '',
  description: '',
  expenseDate: new Date().toISOString().split('T')[0],
}

export default function Fuel() {
  const { canAccess } = usePermission()
  const canEdit = canAccess('fuel', 'edit')

  // ── States ────────────────────────────────────────────────────────────────
  const [totalCost, setTotalCost] = useState(0)
  const [fuelLogs, setFuelLogs]   = useState([])
  const [expenses, setExpenses]   = useState([])
  const [vehicles, setVehicles]   = useState([])
  const [trips, setTrips]         = useState([])

  const [loadingFuel, setLoadingFuel]   = useState(true)
  const [loadingExp, setLoadingExp]     = useState(true)

  const [fuelModalOpen, setFuelModalOpen] = useState(false)
  const [fuelForm, setFuelForm]           = useState(INITIAL_FUEL_FORM)
  const [fuelError, setFuelError]         = useState('')
  const [savingFuel, setSavingFuel]       = useState(false)

  const [expModalOpen, setExpModalOpen]   = useState(false)
  const [expForm, setExpForm]             = useState(INITIAL_EXPENSE_FORM)
  const [expError, setExpError]           = useState('')
  const [savingExp, setSavingExp]         = useState(false)

  // Search states
  const [fuelSearch, setFuelSearch] = useState('')
  const [expSearch, setExpSearch] = useState('')

  // ── Data Fetching ─────────────────────────────────────────────────────────
  const fetchTotalCost = useCallback(async () => {
    try {
      const res = await fuelApi.getFleetTotalCost()
      setTotalCost(res.data.data.total)
    } catch (err) {
      console.error(err)
    }
  }, [])

  const fetchFuelLogs = useCallback(async (search = '') => {
    setLoadingFuel(true)
    try {
      const res = await fuelApi.getFuelLogs({ limit: 10, search })
      setFuelLogs(res.data.data.logs)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingFuel(false)
    }
  }, [])

  const fetchExpenses = useCallback(async (search = '') => {
    setLoadingExp(true)
    try {
      const res = await fuelApi.getExpenses({ limit: 10, search })
      setExpenses(res.data.data.expenses)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingExp(false)
    }
  }, [])

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await vehicleApi.getAll({ limit: 100 })
      setVehicles(res.data.data.vehicles.filter(v => v.status !== 'Retired'))
    } catch (err) {
      console.error(err)
    }
  }, [])

  const fetchTrips = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/trips')
      setTrips(res.data.data || [])
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchTotalCost()
    fetchVehicles()
    fetchTrips()
  }, [fetchTotalCost, fetchVehicles, fetchTrips])

  useEffect(() => {
    fetchFuelLogs(fuelSearch)
  }, [fetchFuelLogs, fuelSearch])

  useEffect(() => {
    fetchExpenses(expSearch)
  }, [fetchExpenses, expSearch])

  const handleExportPDF = () => {
    const doc = new jsPDF()

    // Title & Header
    doc.setFontSize(20)
    doc.setTextColor(30, 41, 59)
    doc.text('TransitOps Operational Cost Report', 14, 22)

    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 14, 30)
    doc.text(`Total Fleet Operational Cost: Rs. ${totalCost.toLocaleString('en-IN')}`, 14, 36)

    // Divider line
    doc.setDrawColor(226, 232, 240)
    doc.line(14, 42, 196, 42)

    // Fuel Logs Table
    doc.setFontSize(14)
    doc.setTextColor(30, 41, 59)
    doc.text('Fuel Records', 14, 52)

    const fuelHeaders = [['Date', 'Vehicle', 'Liters', 'Odometer', 'Total Cost']]
    const fuelRows = fuelLogs.map(log => [
      new Date(log.filledAt).toLocaleDateString('en-IN'),
      log.vehicle?.regNumber || '-',
      `${Number(log.litres)} L`,
      `${Number(log.odometer).toLocaleString()} km`,
      `Rs. ${Number(log.totalCost).toLocaleString('en-IN')}`
    ])

    doc.autoTable({
      startY: 56,
      head: fuelHeaders,
      body: fuelRows,
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11] }, // Amber primary header
      styles: { fontSize: 9 }
    })

    // Expenses Table
    const finalY = doc.lastAutoTable.finalY + 12
    doc.text('Other Miscellaneous Expenses', 14, finalY)

    const expHeaders = [['Vehicle', 'Trip Code', 'Toll (Rs)', 'Other (Rs)', 'Maintenance (Rs)', 'Total (Rs)']]
    const expRows = expenses.map(exp => [
      exp.vehicle?.regNumber || '-',
      exp.trip?.tripCode || '-',
      Number(exp.toll).toLocaleString('en-IN'),
      Number(exp.other).toLocaleString('en-IN'),
      Number(exp.maintenanceLinked).toLocaleString('en-IN'),
      Number(exp.total).toLocaleString('en-IN')
    ])

    doc.autoTable({
      startY: finalY + 4,
      head: expHeaders,
      body: expRows,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }, // Blue secondary header
      styles: { fontSize: 9 }
    })

    doc.save('TransitOps_Operational_Cost_Report.pdf')
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFuelFormChange = (e) => {
    const { name, value } = e.target
    setFuelForm(prev => {
      const updated = { ...prev, [name]: value }
      if (name === 'vehicleId' && value) {
        const sel = vehicles.find(v => v.id === Number(value))
        if (sel) updated.odometer = sel.odometer
      }
      return updated
    })
    if (fuelError) setFuelError('')
  }

  const handleExpFormChange = (e) => {
    const { name, value } = e.target
    setExpForm(prev => ({ ...prev, [name]: value }))
    if (expError) setExpError('')
  }

  const handleSaveFuel = async (e) => {
    e.preventDefault()
    setSavingFuel(true)
    setFuelError('')

    try {
      const payload = {
        ...fuelForm,
        vehicleId: Number(fuelForm.vehicleId),
        tripId: fuelForm.tripId ? Number(fuelForm.tripId) : null,
        liters: parseFloat(fuelForm.liters),
        cost: parseFloat(fuelForm.cost),
        odometer: fuelForm.odometer ? parseInt(fuelForm.odometer, 10) : undefined,
      }

      await fuelApi.createFuelLog(payload)
      setFuelModalOpen(false)
      setFuelForm(INITIAL_FUEL_FORM)
      fetchFuelLogs()
      fetchTotalCost()
      fetchVehicles() // Odometer might have been updated
    } catch (err) {
      setFuelError(err.response?.data?.message || 'Failed to save fuel log.')
    } finally {
      setSavingFuel(false)
    }
  }

  const handleSaveExpense = async (e) => {
    e.preventDefault()
    setSavingExp(true)
    setExpError('')

    try {
      const payload = {
        ...expForm,
        vehicleId: Number(expForm.vehicleId),
        tripId: expForm.tripId ? Number(expForm.tripId) : null,
        toll: expForm.toll ? parseFloat(expForm.toll) : 0,
        other: expForm.other ? parseFloat(expForm.other) : 0,
        maintenanceLinked: expForm.maintenanceLinked ? parseFloat(expForm.maintenanceLinked) : 0,
      }

      await fuelApi.createExpense(payload)
      setExpModalOpen(false)
      setExpForm(INITIAL_EXPENSE_FORM)
      fetchExpenses()
      fetchTotalCost()
    } catch (err) {
      setExpError(err.response?.data?.message || 'Failed to save expense.')
    } finally {
      setSavingExp(false)
    }
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      
      {/* ── Operational Cost Amber KPI Header ───────────────────────────── */}
      <div className="glass-card p-6 border border-amber-500/15 bg-amber-500/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-amber-500 tracking-widest uppercase">Operational Accounting</span>
          <h2 className="text-3xl font-black text-white mt-1">
            TOTAL OPERATIONAL COST (AUTO) = <span className="text-amber-400">₹{totalCost.toLocaleString('en-IN')}</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 italic">
            * This figure automatically aggregates all recorded Fuel Logs + Maintenance Logs.
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 text-xs font-semibold border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors flex items-center gap-2"
          >
            📄 Export PDF
          </button>
          {canEdit && (
            <>
              <button
                onClick={() => setFuelModalOpen(true)}
                className="btn-primary py-2.5 text-xs font-semibold flex items-center gap-2 bg-amber-500 hover:bg-amber-600 border-none text-black"
              >
                + Log Fuel
              </button>
              <button
                onClick={() => setExpModalOpen(true)}
                className="btn-ghost py-2.5 text-xs font-semibold flex items-center gap-2 border border-white/10 hover:border-white/20 text-white"
              >
                + Add Expense
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Side-by-Side Lists ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Fuel Logs Column */}
        <div className="glass-card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between gap-4">
            <h3 className="font-bold text-white text-sm">Fuel Logs</h3>
            <input
              type="text"
              placeholder="Search vehicle..."
              value={fuelSearch}
              onChange={e => setFuelSearch(e.target.value)}
              className="bg-black/55 border border-white/10 rounded-lg py-1 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 w-44"
            />
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Liters</th>
                  <th>Odometer</th>
                  <th>Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {loadingFuel ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j}><div className="skeleton h-4 w-full rounded" /></td>
                      ))}
                    </tr>
                  ))
                ) : fuelLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500 text-xs">
                      No fuel logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  fuelLogs.map(log => (
                    <tr key={log.id}>
                      <td className="text-gray-400 text-xs">
                        {new Date(log.filledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="font-mono text-amber-400 font-medium text-xs">
                        {log.vehicle?.regNumber}
                      </td>
                      <td className="text-gray-300 text-xs">
                        {Number(log.litres)} L
                      </td>
                      <td className="text-gray-400 text-xs">
                        {Number(log.odometer).toLocaleString()} km
                      </td>
                      <td className="text-white font-bold text-xs">
                        ₹{Number(log.totalCost).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses Column */}
        <div className="glass-card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between gap-4">
            <h3 className="font-bold text-white text-sm">Other Expenses (Toll/Misc)</h3>
            <input
              type="text"
              placeholder="Search vehicle..."
              value={expSearch}
              onChange={e => setExpSearch(e.target.value)}
              className="bg-black/55 border border-white/10 rounded-lg py-1 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-44"
            />
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Trip ID</th>
                  <th>Toll</th>
                  <th>Other</th>
                  <th>Maint. (Linked)</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {loadingExp ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j}><div className="skeleton h-4 w-full rounded" /></td>
                      ))}
                    </tr>
                  ))
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500 text-xs">
                      No expenses recorded yet.
                    </td>
                  </tr>
                ) : (
                  expenses.map(exp => (
                    <tr key={exp.id}>
                      <td className="font-mono text-amber-400 font-medium text-xs">
                        {exp.vehicle?.regNumber}
                      </td>
                      <td className="text-gray-400 text-xs">
                        {exp.trip ? <span className="text-blue-400">{exp.trip.tripCode}</span> : <span className="text-gray-600">-</span>}
                      </td>
                      <td className="text-gray-300 text-xs">
                        ₹{Number(exp.toll).toLocaleString('en-IN')}
                      </td>
                      <td className="text-gray-300 text-xs">
                        ₹{Number(exp.other).toLocaleString('en-IN')}
                      </td>
                      <td className="text-gray-300 text-xs">
                        ₹{Number(exp.maintenanceLinked).toLocaleString('en-IN')}
                      </td>
                      <td className="text-white font-bold text-xs">
                        ₹{Number(exp.total).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── Log Fuel Modal ──────────────────────────────────────────────── */}
      <Modal
        isOpen={fuelModalOpen}
        onClose={() => setFuelModalOpen(false)}
        title="Log Fuel Receipt"
        size="md"
      >
        <form onSubmit={handleSaveFuel} className="space-y-4">
          {fuelError && (
            <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
              {fuelError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Vehicle *</label>
              <select
                name="vehicleId"
                value={fuelForm.vehicleId}
                onChange={handleFuelFormChange}
                className="input-field text-sm"
                required
              >
                <option value="">Select Vehicle</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.regNumber} — {v.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Trip (Optional)</label>
              <select
                name="tripId"
                value={fuelForm.tripId}
                onChange={handleFuelFormChange}
                className="input-field text-sm"
              >
                <option value="">None</option>
                {trips.map(t => (
                  <option key={t.id} value={t.id}>{t.tripCode} ({t.origin} ➔ {t.destination})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Fuel Liters *</label>
              <input
                type="number"
                name="liters"
                value={fuelForm.liters}
                onChange={handleFuelFormChange}
                placeholder="40"
                step="0.01"
                className="input-field text-sm"
                required
                min="0.01"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Receipt Cost (₹) *</label>
              <input
                type="number"
                name="cost"
                value={fuelForm.cost}
                onChange={handleFuelFormChange}
                placeholder="4000"
                className="input-field text-sm"
                required
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Odometer (km)</label>
              <input
                type="number"
                name="odometer"
                value={fuelForm.odometer}
                onChange={handleFuelFormChange}
                placeholder="Odometer"
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Station Location</label>
              <input
                type="text"
                name="station"
                value={fuelForm.station}
                onChange={handleFuelFormChange}
                placeholder="e.g. HP Petrol Pump"
                className="input-field text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Receipt Date *</label>
            <input
              type="date"
              name="logDate"
              value={fuelForm.logDate}
              onChange={handleFuelFormChange}
              className="input-field text-sm"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setFuelModalOpen(false)} className="btn-ghost flex-1 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingFuel}
              className="btn-primary flex-1 text-sm bg-amber-500 text-black border-none hover:bg-amber-600 flex items-center justify-center gap-2"
            >
              {savingFuel ? <><Spinner size="sm" /> Saving...</> : 'Log Receipt'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Add Expense Modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={expModalOpen}
        onClose={() => setExpModalOpen(false)}
        title="Add Miscellaneous Expense"
        size="md"
      >
        <form onSubmit={handleSaveExpense} className="space-y-4">
          {expError && (
            <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
              {expError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Vehicle *</label>
              <select
                name="vehicleId"
                value={expForm.vehicleId}
                onChange={handleExpFormChange}
                className="input-field text-sm"
                required
              >
                <option value="">Select Vehicle</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.regNumber} — {v.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Trip (Optional)</label>
              <select
                name="tripId"
                value={expForm.tripId}
                onChange={handleExpFormChange}
                className="input-field text-sm"
              >
                <option value="">None</option>
                {trips.map(t => (
                  <option key={t.id} value={t.id}>{t.tripCode} ({t.origin} ➔ {t.destination})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Toll Cost (₹)</label>
              <input
                type="number"
                name="toll"
                value={expForm.toll}
                onChange={handleExpFormChange}
                placeholder="0"
                className="input-field text-sm"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Other Cost (₹)</label>
              <input
                type="number"
                name="other"
                value={expForm.other}
                onChange={handleExpFormChange}
                placeholder="0"
                className="input-field text-sm"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Maint. Cost (₹)</label>
              <input
                type="number"
                name="maintenanceLinked"
                value={expForm.maintenanceLinked}
                onChange={handleExpFormChange}
                placeholder="0"
                className="input-field text-sm"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Expense Date *</label>
            <input
              type="date"
              name="expenseDate"
              value={expForm.expenseDate}
              onChange={handleExpFormChange}
              className="input-field text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Notes / Description</label>
            <input
              type="text"
              name="description"
              value={expForm.description}
              onChange={handleExpFormChange}
              placeholder="e.g. Highway toll tax"
              className="input-field text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setExpModalOpen(false)} className="btn-ghost flex-1 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingExp}
              className="btn-primary flex-1 text-sm flex items-center justify-center gap-2"
            >
              {savingExp ? <><Spinner size="sm" /> Saving...</> : 'Save Expense'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  )
}
