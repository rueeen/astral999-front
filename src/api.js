import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshPromise = null
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const refresh = localStorage.getItem('refresh')
    if (
      error.response?.status !== 401 ||
      original?._retried ||
      !refresh ||
      original?.url?.includes('/api/auth/refresh/')
    )
      return Promise.reject(error)
    original._retried = true
    try {
      refreshPromise ||= axios.post(`${api.defaults.baseURL}/api/auth/refresh/`, { refresh })
      const { data } = await refreshPromise
      localStorage.setItem('access', data.access)
      if (data.refresh) localStorage.setItem('refresh', data.refresh)
      original.headers.Authorization = `Bearer ${data.access}`
      return api(original)
    } catch (refreshError) {
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      window.dispatchEvent(new Event('auth:expired'))
      return Promise.reject(refreshError)
    } finally {
      refreshPromise = null
    }
  },
)

export default api
