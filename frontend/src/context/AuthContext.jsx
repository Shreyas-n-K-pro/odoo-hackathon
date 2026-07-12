// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Auth Context
// Global authentication state: user, token, role, login, logout.
// Wrap <App> with <AuthProvider> to make auth available everywhere.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/auth.api'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user,  setUser]  = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on app boot
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser  = localStorage.getItem('user')

    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback((tokenStr, userData) => {
    localStorage.setItem('token', tokenStr)
    localStorage.setItem('user',  JSON.stringify(userData))
    setToken(tokenStr)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
