// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Login Page (Screen 0)
// Pixel-close to the mockup: dark navy left panel + clean right panel form.
// Implements: role dropdown, lockout error state, animated entry.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth.api'
import { useAuth } from '../hooks/useAuth'
import { Spinner } from '../components/ui/Spinner'

const ROLES = [
  { value: 'Fleet_Manager',     label: 'Fleet Manager' },
  { value: 'Dispatcher',        label: 'Dispatcher' },
  { value: 'Safety_Officer',    label: 'Safety Officer' },
  { value: 'Financial_Analyst', label: 'Financial Analyst' },
]

const ROLE_ACCESS = {
  Fleet_Manager:     'Fleet, Maintenance, Settings',
  Dispatcher:        'Dashboard, Trips',
  Safety_Officer:    'Drivers, Compliance',
  Financial_Analyst: 'Fuel & Expenses, Analytics',
}

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [form, setForm]       = useState({ email: '', password: '', role: '', rememberMe: false })
  const [error, setError]     = useState('')
  const [isLocked, setIsLocked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password || !form.role) {
      setError('Please fill in all fields including your role.')
      return
    }

    setLoading(true)
    setError('')
    setIsLocked(false)

    try {
      const res = await authApi.login({
        email: form.email,
        password: form.password,
        role: form.role,
      })
      const { token, user } = res.data.data
      login(token, user)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.'
      const code = err.response?.data?.error
      setIsLocked(code === 'ACCOUNT_LOCKED')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-navy-950">
      {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] bg-navy-900 border-r border-white/5 flex-col p-10 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3 mb-12 animate-fade-in">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <svg className="w-7 h-7 text-navy-950" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <rect x="1" y="3" width="15" height="13" rx="2"/>
              <path d="M16 8h4l3 5v3h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">TransitOps</h1>
            <p className="text-amber-400/70 text-xs font-medium">Smart Transport Operations Platform</p>
          </div>
        </div>

        {/* Copy block */}
        <div className="relative flex-1 flex flex-col justify-center animate-slide-up">
          <h2 className="text-3xl font-bold text-white mb-3 leading-snug">
            One login,<br />four roles.
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            Role-based access ensures every team member sees exactly what they need.
          </p>

          <div className="space-y-3">
            {ROLES.map(({ value, label }) => (
              <div key={value} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-amber-500/20 transition-colors">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">Access: {ROLE_ACCESS[value]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-gray-600 text-xs mt-8">
          © 2024 TransitOps · Gandhinagar Depot GJ4
        </p>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 animate-slide-in">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-navy-950" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <rect x="1" y="3" width="15" height="13" rx="2"/>
                <path d="M16 8h4l3 5v3h-7V8z"/>
              </svg>
            </div>
            <span className="text-white font-bold text-lg">TransitOps</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Sign in to your account</h2>
            <p className="text-gray-400 text-sm mt-1.5">Enter your credentials to continue</p>
          </div>

          {/* Error / Lockout Banner */}
          {error && (
            <div className={`mb-6 p-4 rounded-xl border-2 border-dashed animate-fade-in
              ${isLocked
                ? 'border-red-500/50 bg-red-500/10'
                : 'border-red-500/30 bg-red-500/5'}`}
            >
              <div className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-red-300 text-sm leading-relaxed">{error}</p>
              </div>
              {isLocked && (
                <p className="text-red-400/70 text-xs mt-2 pl-6">
                  Account locked after 5 failed attempts. Try again in 15 minutes.
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@transitops.in"
                className="input-field"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pr-11"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPass
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="role">
                Role (RBAC)
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="input-field appearance-none cursor-pointer"
                disabled={loading}
              >
                <option value="">Select your role...</option>
                {ROLES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={form.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-white/20 bg-navy-900 text-amber-500 focus:ring-amber-500/30"
                />
                <span className="text-sm text-gray-400">Remember me</span>
              </label>
              <button type="button" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              id="login-submit-btn"
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2 py-3"
            >
              {loading ? (
                <><Spinner size="sm" /> Signing in...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Access scope footer */}
          <div className="mt-8 p-4 rounded-xl bg-navy-900/50 border border-white/5">
            <p className="text-gray-500 text-xs font-medium mb-2">Access is scoped by role after login:</p>
            <div className="space-y-1">
              {ROLES.map(({ value, label }) => (
                <div key={value} className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">{label}</span>
                  <span className="text-gray-600 text-xs">{ROLE_ACCESS[value]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
