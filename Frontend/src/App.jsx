import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Attendance from './pages/Attendance'
import Tasks from './pages/Tasks'
import Employees from './pages/Employees'
import Reports from './pages/Reports'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import useAuth from './store/useAuth'
import Layout from './components/layout/Layout'

function Protected({ children }){
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />
  return <Layout>{children}</Layout>;
}

export default function App(){
  useEffect(() => {
    useAuth.getState().hydrate()
  }, [])

  return (
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route path="/signup" element={<Signup/>} />
      <Route path="/" element={<Protected><Dashboard/></Protected>} />
      <Route path="/attendance" element={<Protected><Attendance/></Protected>} />
      <Route path="/tasks" element={<Protected><Tasks/></Protected>} />
      <Route path="/employees" element={<Protected><Employees/></Protected>} />
      <Route path="/reports" element={<Protected><Reports/></Protected>} />
      <Route path="/profile" element={<Protected><Profile/></Protected>} />
      <Route path="/admin" element={<Protected><Admin/></Protected>} />
    </Routes>
  )
}
