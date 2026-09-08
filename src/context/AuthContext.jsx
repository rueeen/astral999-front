import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../api'

const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [plan, setPlan] = useState(null),
    [loading, setLoading] = useState(Boolean(localStorage.getItem('access')))
  const logout = useCallback(() => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setUser(null)
    setPlan(null)
    setLoading(false)
  }, [])
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
      logout()
    } finally {
      setLoading(false)
    }
  }, [logout])
  useEffect(() => {
    loadSession()
    window.addEventListener('auth:expired', logout)
    return () => window.removeEventListener('auth:expired', logout)
  }, [loadSession, logout])
  const login = async (username, password) => {
    const { data } = await api.post('/api/auth/login/', { username, password })
    localStorage.setItem('access', data.access)
    localStorage.setItem('refresh', data.refresh)
    await loadSession()
  }
  return (
    <AuthContext.Provider
      value={{ user, setUser, plan, setPlan, loading, login, logout, refreshSession: loadSession }}
    >
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => useContext(AuthContext)
