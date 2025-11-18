import React, { useEffect, useState } from 'react'
import { getAdminOverview } from '../services/reportService'
import useAuth from '../store/useAuth'

export default function Admin(){
  const [overview, setOverview] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role === 'admin') fetchOverview()
  }, [user])

  async function fetchOverview() {
    try {
      const data = await getAdminOverview()
      setOverview(data)
    } catch(err) {
      console.error('Error:', err)
    }
  }

  if (user?.role !== 'admin') {
    return <div className="p-6 text-red-600">Access denied. Admin only.</div>
  }

  if (!overview) return <div className="p-6">Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">System overview and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-600">
          <div className="text-gray-600 text-sm">Present Today</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{overview.present}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-600">
          <div className="text-gray-600 text-sm">Absent Today</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{overview.absent}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600">
          <div className="text-gray-600 text-sm">Average Hours</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{overview.avgHours}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-600">
          <div className="text-gray-600 text-sm">Pending Tasks</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{overview.pendingTasks}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-600">
          <div className="text-gray-600 text-sm">Pending Leaves</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{overview.pendingLeaves}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Total Employees</h2>
        <div className="text-4xl font-bold text-blue-600">{overview.totalEmployees}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-left">
              👥 Manage Employees
            </button>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-left">
              📋 Review Leaves
            </button>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-left">
              📊 Export Reports
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Backend:</span>
              <span className="text-green-600 font-semibold">✓ Online</span>
            </div>
            <div className="flex justify-between">
              <span>Database:</span>
              <span className="text-green-600 font-semibold">✓ Connected</span>
            </div>
            <div className="flex justify-between">
              <span>Storage:</span>
              <span className="text-blue-600 font-semibold">⚙ Configured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
