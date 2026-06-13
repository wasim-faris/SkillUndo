import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/u, '') || 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const GUEST_BROWSABLE_PATHS = ['/matches', '/skills', '/profile'];

// attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (config.data instanceof FormData) {
    if (typeof config.headers.setContentType === 'function') {
      config.headers.setContentType(undefined)
    }
    delete config.headers['Content-Type']
    delete config.headers['content-type']
  }
  return config
})

// handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isAuthUrl = error.config?.url?.includes('/auth/');
    const isGuestBrowsablePath = GUEST_BROWSABLE_PATHS.some((path) => window.location.pathname.startsWith(path));
    if (error.response?.status === 401 && !isAuthUrl && !isGuestBrowsablePath) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.dispatchEvent(new Event('auth:logout'))
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

const cache = new Map()
const inFlightPromises = new Map()

api.getCacheValue = (url, params = {}) => {
  const key = `${url}?${JSON.stringify(params)}`
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < 60000) {
    return cached.response
  }
  return null
}

api.getWithCache = (url, config = {}) => {
  const { cacheTime = 30000, force = false, ...axiosConfig } = config
  const key = `${url}?${JSON.stringify(axiosConfig.params || {})}`
  
  if (!force) {
    const cached = cache.get(key)
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return Promise.resolve(cached.response)
    }
    const inFlight = inFlightPromises.get(key)
    if (inFlight) {
      return inFlight
    }
  }

  const promise = api.get(url, axiosConfig)
    .then((response) => {
      cache.set(key, { timestamp: Date.now(), response })
      inFlightPromises.delete(key)
      return response
    })
    .catch((error) => {
      inFlightPromises.delete(key)
      return Promise.reject(error)
    })

  inFlightPromises.set(key, promise)
  return promise
}

export default api
