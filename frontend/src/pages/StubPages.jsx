const StubPage = ({ title, owner, endpoint }) => (
  <div className="p-6 animate-fade-in">
    <div className="glass-card p-8 text-center">
      <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <p className="text-gray-400 text-sm">{owner} — Implement controllers and service here.</p>
      <p className="text-gray-500 text-xs mt-1 font-mono">{endpoint}</p>
    </div>
  </div>
)

export const Drivers     = () => <StubPage title="Driver Management" owner="Member B" endpoint="GET /api/drivers" />
export const Trips       = () => <StubPage title="Trip Dispatcher"   owner="Member B" endpoint="GET /api/trips" />
export const Maintenance = () => <StubPage title="Maintenance Logs"  owner="Member C" endpoint="GET /api/maintenance" />
export const Fuel        = () => <StubPage title="Fuel & Expenses"   owner="Member C" endpoint="GET /api/fuel" />
export const Analytics   = () => <StubPage title="Analytics"         owner="Member D" endpoint="GET /api/analytics/summary" />
