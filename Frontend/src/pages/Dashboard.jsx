import React, { useEffect, useState } from 'react'
import { getAdminOverview } from '../services/reportService'
import { getMyAttendance, punch as punchApi, requestLeave, setStatus as setStatusApi } from '../services/attendanceService'
import useAuth from '../store/useAuth'
import { decimalHoursToHrsMins } from '../utils/time'

export default function Dashboard(){
  const [overview, setOverview] = useState(null)
  const { user } = useAuth()
  const [myToday, setMyToday] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [allRecords, setAllRecords] = useState([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedStatus, setSelectedStatus] = useState('Present')
  const [editReason, setEditReason] = useState('')

  useEffect(() => {
    if (user?.role === 'admin') fetchOverview()
    else fetchMyToday()
  }, [user])

  async function fetchMyToday() {
    try {
      const data = await getMyAttendance()
      setAllRecords(data || [])
      setMyToday(data?.[0] || null)
    } catch (e) {
      console.error('fetch my today failed', e)
    }
  }

  async function setStatus(status) {
    setStatusLoading(true)
    try {
      // Use unified API to set status for a date
      await setStatusApi({ status: status === 'present' ? 'Present' : status === 'leave' ? 'Leave' : 'Holiday', date: selectedDate, reason: status === 'leave' ? 'Leave' : '' })
      await fetchMyToday()
    } catch (e) {
      console.error('Error setting status:', e)
    } finally {
      setStatusLoading(false)
    }
  }

  async function openEditModal(defaultStatus) {
    setSelectedStatus(defaultStatus || (myToday?.status || 'Present'))
    setSelectedDate(new Date().toISOString().split('T')[0])
    setEditReason('')
    setShowEditModal(true)
  }

  async function submitEdit() {
    setStatusLoading(true)
    try {
      await setStatusApi({ status: selectedStatus, date: selectedDate, reason: editReason })
      await fetchMyToday()
      setShowEditModal(false)
    } catch (e) {
      console.error('Edit failed', e)
      alert(e.response?.data?.message || 'Failed to update status')
    } finally {
      setStatusLoading(false)
    }
  }

  async function fetchOverview() {
    try {
      const data = await getAdminOverview()
      setOverview(data)
    } catch(err) {
      console.error('Error fetching overview:', err)
    }
  }

  if (user?.role === 'admin' && !overview) return <div className="p-6">Loading...</div>

  // Calculate monthly stats for non-admin
  const thisMonth = new Date()
  const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)
  const presentDays = allRecords.filter(r => r.status === 'Present' && new Date(r.date) >= monthStart).length
  const leaveDays = allRecords.filter(r => r.status === 'Leave' && new Date(r.date) >= monthStart).length
  const holidayDays = allRecords.filter(r => r.status === 'Holiday' && new Date(r.date) >= monthStart).length
  const totalHoursThisMonth = allRecords.filter(r => new Date(r.date) >= monthStart).reduce((sum, r) => sum + (Number(r.totalHours) || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name || 'User'}!</p>
        </div>
        {user?.role !== 'admin' && (
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        )}
      </div>
      
      {user?.role !== 'admin' && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-lg font-semibold mb-4">Mark Today's Status</h2>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setStatus('present')}
              disabled={statusLoading || myToday?.status === 'Present'}
              className="flex-1 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              ✓ Present
            </button>
            <button
              onClick={() => setStatus('leave')}
              disabled={statusLoading || myToday?.status === 'Leave'}
              className="flex-1 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              📋 Leave
            </button>
            <button
              onClick={() => setStatus('holiday')}
              disabled={statusLoading || myToday?.status === 'Holiday'}
              className="flex-1 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              🎉 Holiday
            </button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {user?.role === 'admin' && overview ? (
          <>
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-600">
              <div className="text-gray-600 text-sm">Present Today</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{overview.present}</div>
              <div className="text-xs text-gray-500 mt-1">out of {overview.totalEmployees}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-600">
              <div className="text-gray-600 text-sm">Absent Today</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{overview.absent}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600">
              <div className="text-gray-600 text-sm">Avg Hours</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{overview.avgHours}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-600">
              <div className="text-gray-600 text-sm">Pending Tasks</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{overview.pendingTasks}</div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600 hover:shadow-lg transition">
              <div className="text-gray-600 text-sm font-medium">Today's Status</div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 mt-3">{myToday ? myToday.status : '—'}</div>
                    <div className="text-xs text-gray-500 mt-2">Current attendance</div>
                  </div>
                  <div>
                    <button onClick={() => openEditModal(myToday?.status)} className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">Edit</button>
                  </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-600 hover:shadow-lg transition">
              <div className="text-gray-600 text-sm font-medium">Today's Hours</div>
              <div className="text-3xl font-bold text-gray-900 mt-3">{myToday ? decimalHoursToHrsMins(myToday.totalHours) : '0h 00m'}</div>
              <div className="text-xs text-gray-500 mt-2">Hours worked</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-600 hover:shadow-lg transition">
              <div className="text-gray-600 text-sm font-medium">This Month</div>
              <div className="text-3xl font-bold text-gray-900 mt-3">{presentDays}</div>
              <div className="text-xs text-gray-500 mt-2">Days present</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-600 hover:shadow-lg transition">
              <div className="text-gray-600 text-sm font-medium">Monthly Total</div>
              <div className="text-3xl font-bold text-gray-900 mt-3">{decimalHoursToHrsMins(totalHoursThisMonth)}</div>
              <div className="text-xs text-gray-500 mt-2">Total hours</div>
            </div>
          </>
        )}
      </div>
      
      {user?.role !== 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Monthly Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Present Days</span>
                <span className="font-bold text-green-600">{presentDays}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Leave Days</span>
                <span className="font-bold text-blue-600">{leaveDays}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Holiday Days</span>
                <span className="font-bold text-orange-600">{holidayDays}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-700 font-medium">Total Hours</span>
                <span className="font-bold text-gray-900">{decimalHoursToHrsMins(totalHoursThisMonth)}</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Days</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allRecords.slice(0, 7).map(record => (
                <div key={record._id} className="flex justify-between items-center text-sm border-b pb-2">
                  <span className="text-gray-600">{new Date(record.date).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      record.status === 'Present' ? 'bg-green-100 text-green-700' :
                      record.status === 'Leave' ? 'bg-blue-100 text-blue-700' :
                      record.status === 'Holiday' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{record.status}</span>
                    <span className="text-gray-900 font-medium">{decimalHoursToHrsMins(record.totalHours)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Attendance Status</h3>
            <label className="block text-sm text-gray-700 mb-2">Date</label>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full mb-3 p-2 border rounded" />

            <label className="block text-sm text-gray-700 mb-2">Status</label>
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="w-full p-2 border rounded mb-3">
              <option value="Present">Present</option>
              <option value="Leave">Leave</option>
              <option value="Holiday">Holiday</option>
              <option value="Absent">Absent</option>
            </select>

            <label className="block text-sm text-gray-700 mb-2">Reason (optional)</label>
            <input value={editReason} onChange={e => setEditReason(e.target.value)} className="w-full mb-4 p-2 border rounded" />

            {(() => {
              const rec = allRecords.find(r => new Date(r.date).toISOString().slice(0,10) === selectedDate)
              const finalized = rec && rec.punches && rec.punches.length >= 2
              if (finalized && selectedStatus === 'Present') return (<div className="text-sm text-red-600 mb-3">This day has completed punches — cannot change to Present.</div>)
              return null
            })()}

            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={submitEdit} disabled={statusLoading || (allRecords.find(r => new Date(r.date).toISOString().slice(0,10) === selectedDate)?.punches?.length >= 2 && selectedStatus === 'Present')} className="px-4 py-2 bg-blue-600 text-white rounded">{statusLoading ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
