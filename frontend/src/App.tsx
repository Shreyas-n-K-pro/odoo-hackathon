import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// @ts-ignore
import { AuthProvider } from './context/AuthContext';
// @ts-ignore
import { ProtectedRoute } from './components/layout/ProtectedRoute';
// @ts-ignore
import { Sidebar } from './components/layout/Sidebar';
// @ts-ignore
import { Topbar } from './components/layout/Topbar';

// Pages
// @ts-ignore
import Login from './pages/Login';
import { DashboardPage } from './pages/DashboardPage';
// @ts-ignore
import Vehicles from './pages/Vehicles';
// @ts-ignore
import Drivers from './pages/Drivers';
// @ts-ignore
import Trips from './pages/Trips';
// @ts-ignore
import Maintenance from './pages/Maintenance';
// @ts-ignore
import Fuel from './pages/Fuel';
// @ts-ignore
import Settings from './pages/Settings';
// @ts-ignore
import { Analytics } from './pages/StubPages';
import { ReportsPage } from './pages/ReportsPage';

import './index.css';

// ── App Shell Layout ──────────────────────────────────────────────────────────
const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex min-h-screen">
    <Sidebar />
    <div className="flex-1 flex flex-col min-h-screen">
      <Topbar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<AppShell><DashboardPage /></AppShell>} />
            <Route path="/vehicles" element={<AppShell><Vehicles /></AppShell>} />
            <Route path="/drivers" element={<AppShell><Drivers /></AppShell>} />
            <Route path="/trips" element={<AppShell><Trips /></AppShell>} />
            <Route path="/maintenance" element={<AppShell><Maintenance /></AppShell>} />
            <Route path="/fuel" element={<AppShell><Fuel /></AppShell>} />
            <Route path="/fuel-logs" element={<AppShell><Fuel /></AppShell>} />
            <Route path="/expenses" element={<AppShell><Fuel /></AppShell>} />
            <Route path="/analytics" element={<AppShell><ReportsPage /></AppShell>} />
            <Route path="/reports" element={<AppShell><ReportsPage /></AppShell>} />
            <Route path="/intelligence" element={<AppShell><ReportsPage /></AppShell>} />
            <Route path="/settings" element={<AppShell><Settings /></AppShell>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
