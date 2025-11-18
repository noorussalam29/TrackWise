import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Sidebar({ open }){
  const location = useLocation()
  
  const links = [
    { path: '/', label: '📊 Dashboard' },
    { path: '/attendance', label: '⏱️ Attendance' },
    { path: '/tasks', label: '✅ Tasks' },
    { path: '/employees', label: '👥 Employees' },
    { path: '/reports', label: '📈 Reports' },
    { path: '/admin', label: '⚙️ Admin' },
    { path: '/profile', label: '👤 Profile' }
  ]
  
  return (
    <aside className={`${open ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col border-r border-gray-800`}>
      <div className="p-4 border-b border-gray-800">
        <h1 className={`font-bold ${open ? 'text-lg' : 'text-xs text-center'}`}>
          {open ? 'TrackWise' : 'TW'}
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`block px-4 py-3 rounded transition ${
              location.pathname === link.path
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-800 text-gray-300'
            } ${!open && 'text-center px-2'}`}
          >
            {open ? link.label : link.label.charAt(0)}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

