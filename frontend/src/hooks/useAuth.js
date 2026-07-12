import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

/**
 * useAuth — access global auth state and actions
 * @returns {{ user, token, loading, isAuthenticated, login, logout }}
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
