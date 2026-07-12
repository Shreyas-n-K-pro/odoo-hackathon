import { useAuth } from './useAuth'

// RBAC map mirrors backend constants.js — keep in sync
const RBAC_MAP = {
  Fleet_Manager: {
    fleet: 'edit', drivers: 'edit', trips: 'view',
    fuel: 'none', analytics: 'edit', dashboard: 'view',
    maintenance: 'edit', settings: 'edit',
  },
  Dispatcher: {
    fleet: 'view', drivers: 'view', trips: 'edit',
    fuel: 'none', analytics: 'none', dashboard: 'view',
    maintenance: 'view', settings: 'none',
  },
  Safety_Officer: {
    fleet: 'none', drivers: 'edit', trips: 'view',
    fuel: 'none', analytics: 'none', dashboard: 'view',
    maintenance: 'none', settings: 'none',
  },
  Financial_Analyst: {
    fleet: 'view', drivers: 'none', trips: 'none',
    fuel: 'edit', analytics: 'edit', dashboard: 'view',
    maintenance: 'none', settings: 'none',
  },
}

/**
 * usePermission — check if the current user can access a module
 * @returns {{ canAccess: (module, level) => boolean, userPermission: (module) => string }}
 */
export const usePermission = () => {
  const { user } = useAuth()

  const canAccess = (module, level = 'view') => {
    if (!user?.role) return false
    const userPerm = RBAC_MAP[user.role]?.[module] || 'none'
    if (userPerm === 'none') return false
    if (level === 'view') return userPerm === 'view' || userPerm === 'edit'
    return userPerm === 'edit'
  }

  const userPermission = (module) => {
    if (!user?.role) return 'none'
    return RBAC_MAP[user.role]?.[module] || 'none'
  }

  return { canAccess, userPermission }
}
