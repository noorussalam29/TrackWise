import React from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../store/useAuth'
import { logout } from '../../services/authService'

export default function Topbar({ onMenuClick }){
  const navigate = useNavigate()
  const { user, setAuth } = useAuth()
  
  async function handleLogout(){
    try {
      await logout()
      setAuth(null, null)
      navigate('/login')
    } catch(err) {
      console.error('Logout error:', err)
      setAuth(null, null)
      navigate('/login')
    }
  }
  
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded"
        >
          ☰
        </button>
        <h2 className="text-xl font-semibold text-gray-800">TrackWise</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          Welcome, <span className="font-semibold">{user?.name || user?.email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

