import api from './api'
import axios from 'axios'

export async function login(email, password){
  try {
    const resp = await api.post('/auth/login', { email, password })
    if (resp.data?.accessToken) {
      // persist tokens and user for hydration across reloads
      localStorage.setItem('refreshToken', resp.data.refreshToken)
      localStorage.setItem('accessToken', resp.data.accessToken)
      if (resp.data.user) localStorage.setItem('user', JSON.stringify(resp.data.user))
      // set axios default header immediately
      api.defaults.headers.common.Authorization = `Bearer ${resp.data.accessToken}`
    }
    return resp.data
  } catch(err) {
    console.error('Login error:', err.response?.status, err.response?.data || err.message)
    throw err
  }
}

export async function register(payload){
  const resp = await api.post('/auth/register', payload)
  return resp.data
}

export async function logout(){
  try {
    const token = localStorage.getItem('refreshToken')
    if (token) await api.post('/auth/logout', { token })
  } catch (e) {
    console.warn('Logout request failed', e?.message)
  }
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('user')
  delete api.defaults.headers.common.Authorization
}

export async function refreshAccessToken(){
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return null
  try {
    const url = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api') + '/auth/refresh'
    const resp = await axios.post(url, { token: refreshToken })
    const token = resp.data?.accessToken
    if (token) {
      localStorage.setItem('accessToken', token)
      api.defaults.headers.common.Authorization = `Bearer ${token}`
      return token
    }
    return null
  } catch (err) {
    console.error('Refresh token failed', err.response?.data || err.message)
    return null
  }
}
