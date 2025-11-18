import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { refreshAccessToken } from './services/authService'
import useAuth from './store/useAuth'

async function boot() {
  // If accessToken missing but refreshToken exists, try to refresh before rendering
  const accessToken = localStorage.getItem('accessToken')
  const userStr = localStorage.getItem('user')
  if (!accessToken && localStorage.getItem('refreshToken')) {
    const token = await refreshAccessToken()
    if (token) {
      // restore user from storage
      const u = userStr ? JSON.parse(userStr) : null
      if (u) useAuth.getState().setAuth(u, token)
    }
  } else if (accessToken && userStr) {
    // ensure store has the values (in case module initialization didn't)
    try { useAuth.getState().setAuth(JSON.parse(userStr), accessToken) } catch(e) {}
  }

  createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
}

boot()
