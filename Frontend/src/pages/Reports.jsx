import React, { useState, useEffect } from 'react'
import { getReports, createDailyReport } from '../services/reportService'
import useAuth from '../store/useAuth'

export default function Reports(){
  const [reports, setReports] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const [form, setForm] = useState({
    tasksCompleted: '',
    hoursWorked: '',
    challenges: '',
    planForTomorrow: ''
  })

  useEffect(() => {
    fetchReports()
  }, [user])

  async function fetchReports() {
    try {
      const data = await getReports(user?.id)
      setReports(data || [])
    } catch(err) {
      console.error('Error fetching reports:', err)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        tasksCompleted: form.tasksCompleted.split(',').map(t => t.trim()).filter(t => t),
        hoursWorked: parseFloat(form.hoursWorked),
        challenges: form.challenges,
        planForTomorrow: form.planForTomorrow
      }
      await createDailyReport(payload)
      setForm({ tasksCompleted: '', hoursWorked: '', challenges: '', planForTomorrow: '' })
      setShowForm(false)
      await fetchReports()
    } catch(err) {
      alert('Error creating report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">Daily work reports</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
        >
          + New Report
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Tasks completed (comma-separated)"
              value={form.tasksCompleted}
              onChange={e => setForm({ ...form, tasksCompleted: e.target.value })}
              className="w-full border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Hours worked"
              step="0.25"
              value={form.hoursWorked}
              onChange={e => setForm({ ...form, hoursWorked: e.target.value })}
              className="w-full border p-2 rounded"
            />
            <textarea
              placeholder="Challenges faced"
              value={form.challenges}
              onChange={e => setForm({ ...form, challenges: e.target.value })}
              className="w-full border p-2 rounded"
              rows={3}
            />
            <textarea
              placeholder="Plan for tomorrow"
              value={form.planForTomorrow}
              onChange={e => setForm({ ...form, planForTomorrow: e.target.value })}
              className="w-full border p-2 rounded"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reports List */}
      <div className="grid gap-4">
        {reports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No reports yet</div>
        ) : (
          reports.map(report => (
            <div key={report._id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  {new Date(report.date).toLocaleDateString()}
                </h3>
                <span className="text-sm text-gray-600">{report.hoursWorked} hours</span>
              </div>
              
              {report.tasksCompleted?.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700">Tasks:</p>
                  <ul className="text-sm text-gray-600 ml-4 list-disc">
                    {report.tasksCompleted.map((task, i) => <li key={i}>{task}</li>)}
                  </ul>
                </div>
              )}
              
              {report.challenges && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700">Challenges:</p>
                  <p className="text-sm text-gray-600">{report.challenges}</p>
                </div>
              )}
              
              {report.planForTomorrow && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Plan for tomorrow:</p>
                  <p className="text-sm text-gray-600">{report.planForTomorrow}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
