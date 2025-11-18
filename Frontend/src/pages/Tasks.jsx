import React, { useState, useEffect } from 'react'
import { getTasks, createTask, updateTask, deleteTask } from '../services/taskService'
import { getEmployees } from '../services/employeeService'
import useAuth from '../store/useAuth'

export default function Tasks(){
  const [tasks, setTasks] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('todo')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [assignedTo, setAssignedTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    fetchTasks()
    fetchEmployees()
  }, [filter])

  async function fetchEmployees() {
    try {
      const data = await getEmployees('', 1)
      setEmployees(data.employees || [])
    } catch (err) {
      console.error('Error fetching employees:', err)
    }
  }

  async function fetchTasks() {
    try {
      const data = await getTasks(filter)
      setTasks(data.tasks || [])
    } catch(err) {
      console.error('Error fetching tasks:', err)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await createTask({ title, description, priority, status: 'todo', assignedTo: assignedTo || null })
      setTitle('')
      setDescription('')
      setPriority('medium')
      setAssignedTo('')
      setShowForm(false)
      await fetchTasks()
    } catch(err) {
      alert('Error creating task')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      await updateTask(id, { status: newStatus })
      await fetchTasks()
    } catch(err) {
      console.error('Error updating task:', err)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this task?')) return
    try {
      await deleteTask(id)
      await fetchTasks()
    } catch(err) {
      console.error('Error deleting task:', err)
    }
  }

  const statuses = ['todo', 'in-progress', 'done', 'blocked']
  const grouped = statuses.reduce((acc, status) => {
    acc[status] = tasks.filter(t => t.status === status)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-2">Manage your tasks with Kanban board</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
        >
          + New Task
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border p-2 rounded"
              rows={3}
            />
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <select
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Assign to employee (optional)</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name || emp.email}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Create
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

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statuses.map(status => (
          <div key={status} className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4 capitalize">
              {status.replace('-', ' ')} ({grouped[status].length})
            </h3>
            <div className="space-y-3">
              {grouped[status].map(task => (
                <div key={task._id} className="bg-white p-4 rounded shadow hover:shadow-md">
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  {task.assignedTo && (
                    <p className="text-xs text-blue-600 mt-2">👤 {task.assignedTo.name || task.assignedTo}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3 justify-between">
                    <span className={`text-xs px-2 py-1 rounded ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {task.priority}
                    </span>
                    <select
                      value={task.status}
                      onChange={e => handleStatusChange(task._id, e.target.value)}
                      className="text-xs border p-1 rounded"
                    >
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="text-xs text-red-600 hover:text-red-800 mt-2"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
