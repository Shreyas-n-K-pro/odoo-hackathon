// ─── Dashboard Page (Stub for Member D) ─────────────────────────────────────
import { Spinner } from '../components/ui/Spinner'

export default function Dashboard() {
  return (
    <div className="p-6 animate-fade-in">
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Dashboard</h2>
        <p className="text-gray-400 text-sm">Member D — Connect analytics endpoints here.</p>
        <p className="text-gray-500 text-xs mt-1">GET /api/analytics/summary</p>
      </div>
    </div>
  )
}
