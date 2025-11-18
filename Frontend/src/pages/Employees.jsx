import React, { useState, useEffect } from 'react'
import { getEmployees, deleteEmployee } from '../services/employeeService'
import useAuth from '../store/useAuth'

export default function Employees(){
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    fetchEmployees()
  }, [search, page])

  async function fetchEmployees() {
    setLoading(true)
    try {
      const data = await getEmployees(search, page)
      setEmployees(data.employees || [])
      setTotal(data.total || 0)
    } catch(err) {
      console.error('Error fetching employees:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete employee?')) return
    try {
      await deleteEmployee(id)
      await fetchEmployees()
    } catch(err) {
      alert('Error deleting employee')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
        <p className="text-gray-600 mt-2">Manage team members</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Position</th>
              {user?.role === 'admin' && <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-4 text-center">Loading...</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No employees found</td></tr>
            ) : (
              employees.map(emp => (
                <tr key={emp._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{emp.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{emp.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 capitalize">{emp.role}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{emp.department || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{emp.position || '-'}</td>
                  {user?.role === 'admin' && (
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleDelete(emp._id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Total: {total} | Page {page}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-300 text-gray-900 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={employees.length < 10}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
