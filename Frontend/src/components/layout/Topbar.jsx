import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../store/useAuth'
import { logout } from '../../services/authService'
import { User, Settings, LogOut } from 'lucide-react'

export default function Topbar({ onMenuClick }){
  const navigate = useNavigate()
  const { user, setAuth } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileMenuRef = useRef(null)
  
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
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
      
      <div className="flex items-center gap-4 relative" ref={profileMenuRef}>
        <div className="text-sm text-gray-600">
          {user?.firstLogin ? (
            <>Welcome, <span className="font-semibold">{user?.name || user?.email}</span></>
          ) : (
            <>Hi, <span className="font-semibold">{user?.name || user?.email}</span></>
          )}
        </div>
        
        {/* Profile Avatar Button */}
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors font-bold text-sm shadow-sm"
          title="Profile menu"
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
        </button>

        {/* Dropdown Menu */}
        {profileOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Account</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{user?.name || user?.email}</p>
            </div>
            <div className="py-2">
              <button
                onClick={() => {
                  navigate('/profile')
                  setProfileOpen(false)
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <User size={16} className="text-gray-400" />
                Profile
              </button>
              <button
                onClick={() => {
                  navigate('/settings')
                  setProfileOpen(false)
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <Settings size={16} className="text-gray-400" />
                Settings
              </button>
              <div className="border-t border-gray-100 my-2" />
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

