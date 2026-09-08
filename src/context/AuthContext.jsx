import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../api'

const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [plan, setPlan] = useState(null),
    [loading, setLoading] = useState(Boolean(localStorage.getItem('access'))),
    [loggingOut, setLoggingOut] = useState(false)
  const clearSession = useCallback(() => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setUser(null)
    setPlan(null)
    setLoading(false)
  }, [])
  const logout = useCallback(async () => {
    if (loggingOut) return
    const refresh = localStorage.getItem('refresh')
    setLoggingOut(true)
    try {
      if (refresh) await api.post('/api/auth/logout/', { refresh })
    } catch (error) {
      console.error('No se pudo invalidar el refresh token al cerrar sesión.', error)
    } finally {
      clearSession()
      setLoggingOut(false)
    }
  }, [clearSession, loggingOut])
  const loadSession = useCallback(async () => {
    if (!localStorage.getItem('access')) {
      setLoading(false)
      return
    }
    try {
      const [profile, quota] = await Promise.all([
        api.get('/api/users/me/'),
        api.get('/api/users/me/quota/'),
      ])
      setUser(profile.data)
      setPlan(quota.data)
    } catch {
      clearSession()
    } finally {
      setLoading(false)
    }
  }, [clearSession])
  useEffect(() => {
    loadSession()
    window.addEventListener('auth:expired', clearSession)
    return () => window.removeEventListener('auth:expired', clearSession)
  }, [clearSession, loadSession])
  const login = async (username, password) => {
    const { data } = await api.post('/api/auth/login/', { username, password })
    localStorage.setItem('access', data.access)
    localStorage.setItem('refresh', data.refresh)
    await loadSession()
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        plan,
        setPlan,
        loading,
        loggingOut,
        login,
        logout,
        clearSession,
        refreshSession: loadSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => useContext(AuthContext)
