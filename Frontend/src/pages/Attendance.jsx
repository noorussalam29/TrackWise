import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { getMyAttendance, punch as punchApi, requestLeave } from '../services/attendanceService'
import { decimalHoursToHrsMins, msToHrsMins } from '../utils/time'
import useAuth from '../store/useAuth'

export default function Attendance(){
  const { user } = useAuth()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState([])
  const [error, setError] = useState('')
  const [allEmployeeRecords, setAllEmployeeRecords] = useState([])

  useEffect(() => {
    fetchRecords()
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const [now, setNow] = useState(new Date())

  async function fetchRecords() {
    try {
      const resp = await getMyAttendance()
      setRecords(resp || [])
      // For admin: also fetch all employee punch data
      if (user?.role === 'admin') {
        try {
          const allRecords = await api.get('/attendance')
          setAllEmployeeRecords(allRecords.data || [])
        } catch (e) {
          console.error('Error fetching all employee records:', e)
        }
      }
    } catch(err) {
      console.error('Fetch error:', err)
    }
  }

  async function punch(type) {
    setLoading(true)
    setError('')
    try {
      await punchApi(type)
      setStatus(`✅ ${type === 'in' ? 'Punched In' : 'Punched Out'}!`)
      await fetchRecords()
      setTimeout(() => setStatus(null), 3000)
    } catch(err) {
      const msg = err.response?.data?.message || 'Error recording punch'
      setError(msg)
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }

  async function sendLeave(e) {
    e.preventDefault()
    const form = e.target
    const reason = form.reason.value
    setLoading(true)
    try {
      await requestLeave({ reason })
      setStatus('✅ Leave requested')
      await fetchRecords()
      setTimeout(() => setStatus(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Leave request failed')
    } finally { setLoading(false) }
  }

  const today = records[0]
  const lastPunch = today?.punches?.[today.punches.length - 1]
  const isPunchedIn = lastPunch?.type === 'in'

  // Calculate monthly stats
  const thisMonth = new Date()
  const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)
  const monthRecords = records.filter(r => new Date(r.date) >= monthStart)
  const presentDays = monthRecords.filter(r => r.status === 'Present').length
  const leaveDays = monthRecords.filter(r => r.status === 'Leave').length
  const absenceDays = monthRecords.filter(r => r.status === 'Absent').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-2">{user?.role === 'admin' ? 'View all employee punch records' : 'Track your daily work hours'}</p>
        </div>
      </div>

      {/* EMPLOYEE VIEW: Punch Card & Leave Request */}
      {user?.role !== 'admin' && (
        <>
          {/* Punch Card - Professional Design */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md border border-blue-100 p-8">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Attendance</h2>
              
              <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Current Time</div>
                    <div className="text-3xl font-bold text-gray-900 mt-2">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                  </div>
                  
                  <div className="border-l border-r border-gray-200" />
                  
                  <div className="text-center">
                    <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Status</div>
                    <div className={`text-2xl font-bold mt-2 ${isPunchedIn ? 'text-green-600' : 'text-orange-600'}`}>
                      {isPunchedIn ? '✓ Present' : '● Not Punched'}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-xs uppercase tracking-wide text-gray-600 font-semibold">Hours Worked Today</div>
                  <div className="text-4xl font-bold text-blue-600 mt-2">{decimalHoursToHrsMins(today?.totalHours)}</div>
                </div>
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
              {status && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">{status}</div>}

              <div className="flex gap-4">
                <button
                  onClick={() => punch('in')}
                  disabled={loading || isPunchedIn}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {loading ? '⏳ Recording...' : '▶ Punch In'}
                </button>
                <button
                  onClick={() => punch('out')}
                  disabled={loading || !isPunchedIn}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {loading ? '⏳ Recording...' : '⏹ Punch Out'}
                </button>
              </div>
            </div>
          </div>

          {/* Leave request */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Request Leave</h3>
            <form onSubmit={sendLeave} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason (optional)</label>
                <input name="reason" placeholder="e.g., Medical, Personal, etc." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition">Request</button>
            </form>
            <p className="text-xs text-gray-500 mt-3">This marks today as Leave. Admins can adjust if needed.</p>
          </div>

          {/* Monthly Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-md border border-purple-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Monthly Attendance Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3 mx-auto">
                  <span className="text-green-600 font-bold text-lg">✓</span>
                </div>
                <div className="text-3xl font-bold text-green-600">{presentDays}</div>
                <div className="text-sm text-gray-600 mt-2">Present Days</div>
              </div>
              <div className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3 mx-auto">
                  <span className="text-blue-600 font-bold text-lg">📋</span>
                </div>
                <div className="text-3xl font-bold text-blue-600">{leaveDays}</div>
                <div className="text-sm text-gray-600 mt-2">Leave Days</div>
              </div>
              <div className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-3 mx-auto">
                  <span className="text-orange-600 font-bold text-lg">●</span>
                </div>
                <div className="text-3xl font-bold text-orange-600">{absenceDays}</div>
                <div className="text-sm text-gray-600 mt-2">Absent Days</div>
              </div>
            </div>
          </div>

          {/* Punch History */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Attendance History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Punch Times</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hours</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No attendance records</td>
                    </tr>
                  ) : (
                    records.map(record => (
                      <tr key={record._id} className="border-b hover:bg-blue-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {record.punches && record.punches.length > 0 ? (
                            record.punches.map((p, i) => (
                              <span key={i} className="block text-xs">
                                <span className={p.type === 'in' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{p.type.toUpperCase()}</span> {new Date(p.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                          {decimalHoursToHrsMins(record.totalHours)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
                            record.status === 'Present' ? 'bg-green-600' :
                            record.status === 'Absent' ? 'bg-red-600' :
                            record.status === 'Leave' ? 'bg-blue-600' :
                            record.status === 'Holiday' ? 'bg-purple-600' :
                            'bg-gray-600'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ADMIN VIEW: All Employee Punch Data */}
      {user?.role === 'admin' && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-lg font-bold text-gray-900">All Employee Punch Records</h3>
            <p className="text-sm text-gray-600 mt-1">View punch in/out data for all employees</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Employee</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Punch In</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Punch Out</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hours</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {allEmployeeRecords.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No punch records found</td>
                  </tr>
                ) : (
                  allEmployeeRecords.map(record => {
                    const punchIn = record.punches?.find(p => p.type === 'in')
                    const punchOut = record.punches?.find(p => p.type === 'out')
                    return (
                      <tr key={record._id} className="border-b hover:bg-blue-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {record.userId?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-green-600">
                          {punchIn ? new Date(punchIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-red-600">
                          {punchOut ? new Date(punchOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                          {decimalHoursToHrsMins(record.totalHours)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
                            record.status === 'Present' ? 'bg-green-600' :
                            record.status === 'Absent' ? 'bg-red-600' :
                            record.status === 'Leave' ? 'bg-blue-600' :
                            'bg-gray-600'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

