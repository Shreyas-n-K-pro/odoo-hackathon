// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Application Router
// ─────────────────────────────────────────────────────────────────────────────

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { Sidebar } from './components/layout/Sidebar'
import { Topbar } from './components/layout/Topbar'

// Pages
import Login      from './pages/Login'
import Dashboard  from './pages/Dashboard'
import Vehicles   from './pages/Vehicles'
import Settings   from './pages/Settings'
import Drivers     from './pages/Drivers'
import Trips       from './pages/Trips'
import Maintenance from './pages/Maintenance'
import Fuel        from './pages/Fuel'
import { Analytics } from './pages/StubPages'

// ── App Shell Layout ──────────────────────────────────────────────────────────
// Renders Sidebar + Topbar for all authenticated routes
const AppShell = ({ children }) => (
  <div className="flex min-h-screen">
    <Sidebar />
    <div className="flex-1 flex flex-col min-h-screen">
      <Topbar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/"     element={<Navigate to="/dashboard" replace />} />

          {/* Protected — require auth */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard"   element={<AppShell><Dashboard /></AppShell>} />

            {/* Fleet (view: all roles, edit: Fleet Manager) */}
            <Route element={<ProtectedRoute module="fleet" level="view" />}>
              <Route path="/vehicles" element={<AppShell><Vehicles /></AppShell>} />
            </Route>

            {/* Drivers (Safety Officer, Fleet Manager) */}
            <Route element={<ProtectedRoute module="drivers" level="view" />}>
              <Route path="/drivers" element={<AppShell><Drivers /></AppShell>} />
            </Route>

            {/* Trips (Dispatcher, Safety Officer view) */}
            <Route element={<ProtectedRoute module="trips" level="view" />}>
              <Route path="/trips" element={<AppShell><Trips /></AppShell>} />
            </Route>

            {/* Maintenance (Fleet Manager) */}
            <Route element={<ProtectedRoute module="maintenance" level="view" />}>
              <Route path="/maintenance" element={<AppShell><Maintenance /></AppShell>} />
            </Route>

            {/* Fuel & Expenses (Financial Analyst) */}
            <Route element={<ProtectedRoute module="fuel" level="view" />}>
              <Route path="/fuel" element={<AppShell><Fuel /></AppShell>} />
            </Route>

            {/* Analytics (Fleet Manager + Financial Analyst) */}
            <Route element={<ProtectedRoute module="analytics" level="view" />}>
              <Route path="/analytics" element={<AppShell><Analytics /></AppShell>} />
            </Route>

            {/* Settings (Fleet Manager only) */}
            <Route element={<ProtectedRoute module="settings" level="edit" />}>
              <Route path="/settings" element={<AppShell><Settings /></AppShell>} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
