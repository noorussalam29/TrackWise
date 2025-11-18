import axios from 'axios'
import useAuth from '../store/useAuth'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api', withCredentials: true })

// request: attach token
api.interceptors.request.use((config) => {
  const state = useAuth.getState();
  if (state.accessToken) config.headers.Authorization = `Bearer ${state.accessToken}`;
  return config;
})

// response: handle 401 -> try refresh
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token)))
  failedQueue = []
}

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject){
          failedQueue.push({ resolve, reject })
        }).then(token => { original.headers.Authorization = 'Bearer ' + token; return api(original) })
      }
      original._retry = true
      isRefreshing = true
      try {
        const refreshResp = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:4000/api') + '/auth/refresh', { token: localStorage.getItem('refreshToken') })
        const token = refreshResp.data.accessToken
        useAuth.getState().setAuth(useAuth.getState().user, token)
        processQueue(null, token)
        original.headers.Authorization = 'Bearer ' + token
        return api(original)
      } catch (e) {
        processQueue(e, null)
        useAuth.getState().logout()
        return Promise.reject(e)
      } finally { isRefreshing = false }
    }
    return Promise.reject(err)
  }
)

export default api
