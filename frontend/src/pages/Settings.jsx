// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Settings & RBAC Page (Screen 8)
// Left card: General settings. Right card: RBAC matrix (read-only display).
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { settingsApi } from '../api/settings.api'
import { usePermission } from '../hooks/usePermission'
import { Spinner } from '../components/ui/Spinner'

const PERMISSION_DISPLAY = {
  edit: { label: '✅ Edit', className: 'text-emerald-400' },
  view: { label: '👁 View', className: 'text-blue-400' },
  none: { label: '—',       className: 'text-gray-600' },
}

const MODULE_LABELS = {
  fleet:       'Fleet',
  drivers:     'Drivers',
  trips:       'Trips',
  fuel:        'Fuel/Expenses',
  analytics:   'Analytics',
  dashboard:   'Dashboard',
  maintenance: 'Maintenance',
  settings:    'Settings',
}

const ROLE_LABELS = {
  Fleet_Manager:     'Fleet Manager',
  Dispatcher:        'Dispatcher',
  Safety_Officer:    'Safety Officer',
  Financial_Analyst: 'Financial Analyst',
}

export default function Settings() {
  const { canAccess } = usePermission()
  const canEdit = canAccess('settings', 'edit')

  const [settings, setSettings]   = useState(null)
  const [rbac, setRbac]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [form, setForm]           = useState({ depotName: '', currency: '', distanceUnit: '' })
  const [saving, setSaving]       = useState(false)
  const [saveMsg, setSaveMsg]     = useState('')
  const [isDirty, setIsDirty]     = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sRes, rRes] = await Promise.all([
          settingsApi.get(),
          settingsApi.getRbacMatrix(),
        ])
        const s = sRes.data.data
        setSettings(s)
        setForm({ depotName: s.depotName, currency: s.currency, distanceUnit: s.distanceUnit })
        setRbac(rRes.data.data)
      } catch { /* interceptor handles */ }
      finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setIsDirty(true)
    setSaveMsg('')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await settingsApi.update(form)
      setSaveMsg('Settings saved successfully.')
      setIsDirty(false)
      setTimeout(() => setSaveMsg(''), 3000)
    } catch (err) {
      setSaveMsg(err.response?.data?.message || 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ── General Settings Card ────────────────────────────── */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-1">General</h2>
          <p className="text-gray-500 text-sm mb-6">Depot-level configuration</p>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Depot Name</label>
              <input
                name="depotName"
                value={form.depotName}
                onChange={handleChange}
                className="input-field"
                disabled={!canEdit}
                placeholder="e.g. Gandhinagar Depot GJ4"
                id="depot-name-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Currency</label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="input-field"
                disabled={!canEdit}
                id="currency-select"
              >
                <option value="INR (Rs)">INR (Rs)</option>
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Distance Unit</label>
              <select
                name="distanceUnit"
                value={form.distanceUnit}
                onChange={handleChange}
                className="input-field"
                disabled={!canEdit}
                id="distance-unit-select"
              >
                <option value="Kilometers">Kilometers</option>
                <option value="Miles">Miles</option>
              </select>
            </div>

            {saveMsg && (
              <div className={`text-sm px-3 py-2 rounded-lg border ${
                saveMsg.includes('success')
                  ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                  : 'text-red-400 border-red-500/20 bg-red-500/10'
              }`}>
                {saveMsg}
              </div>
            )}

            {canEdit && (
              <button
                type="submit"
                disabled={saving || !isDirty}
                id="save-settings-btn"
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <><Spinner size="sm" /> Saving...</> : 'Save changes'}
              </button>
            )}

            {!canEdit && (
              <p className="text-gray-500 text-xs text-center">
                Only Fleet Manager can modify settings.
              </p>
            )}
          </form>
        </div>

        {/* ── RBAC Matrix Card ─────────────────────────────────── */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Role-Based Access (RBAC)</h2>
          <p className="text-gray-500 text-sm mb-6">Read-only permission matrix — enforced server-side</p>

          {rbac ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Module
                    </th>
                    {rbac.roles.map(role => (
                      <th key={role} className="text-center py-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {ROLE_LABELS[role] || role}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rbac.modules.map((mod, i) => (
                    <tr key={mod} className={`${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                      <td className="py-2.5 pr-4 text-gray-300 font-medium capitalize">
                        {MODULE_LABELS[mod] || mod}
                      </td>
                      {rbac.roles.map(role => {
                        const perm = rbac.matrix[role][mod]
                        const display = PERMISSION_DISPLAY[perm] || PERMISSION_DISPLAY.none
                        return (
                          <td key={role} className={`py-2.5 px-2 text-center text-xs font-medium ${display.className}`}>
                            {display.label}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <Spinner />
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex flex-wrap gap-4">
              {Object.entries(PERMISSION_DISPLAY).map(([key, { label, className }]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className={`text-xs font-medium ${className}`}>{label}</span>
                  <span className="text-gray-600 text-xs capitalize">{key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
