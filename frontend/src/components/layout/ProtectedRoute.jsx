// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Protected Route
// Redirects to /login if not authenticated.
// Optionally checks module + permission level for granular route guarding.
// ─────────────────────────────────────────────────────────────────────────────

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { usePermission } from '../../hooks/usePermission'
import { PageLoader } from '../ui/Spinner'

/**
 * ProtectedRoute — wraps a group of routes requiring authentication
 * @param {string} module     - Optional module name for RBAC check
 * @param {string} level      - 'view' | 'edit'
 * @param {string} redirectTo - Where to redirect if access denied
 */
export const ProtectedRoute = ({ module, level = 'view', redirectTo = '/login' }) => {
  const { isAuthenticated, loading } = useAuth()
  const { canAccess } = usePermission()

  if (loading) return <PageLoader />

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  // If a module is specified, check RBAC
  if (module && !canAccess(module, level)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
