import React, { useState } from 'react'
import useAuth from '../store/useAuth'

export default function Profile(){
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    position: user?.position || ''
  })

  async function handleSave() {
    // TODO: Implement profile update API call
    alert('Profile update coming soon!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account settings</p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow max-w-2xl">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-500 capitalize mt-1">{user?.role}</p>
          </div>
        </div>

        {isEditing ? (
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border p-2 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                disabled
                className="w-full border p-2 rounded bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
                className="w-full border p-2 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <input
                type="text"
                value={form.position}
                onChange={e => setForm({ ...form, position: e.target.value })}
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <p className="text-gray-900 mt-1">{form.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900 mt-1">{form.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <p className="text-gray-900 mt-1">{form.department || 'Not set'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <p className="text-gray-900 mt-1">{form.position || 'Not set'}</p>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mt-4"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-8 rounded-lg shadow max-w-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
        <button className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">
          Change Password
        </button>
      </div>
    </div>
  )
}
