import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../../services/authService'
import useAuth from '../../store/useAuth'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const setAuth = useAuth(state => state.setAuth)

  async function handle(e){
    e.preventDefault()
    setLoading(true)
    setError('')
    try{
      const data = await login(email, password)
      setAuth(data.user, data.accessToken)
      navigate('/')
    }catch(err){
      const msg = err.response?.data?.message || err.message || 'Login failed. Check backend connection.'
      console.error('Full error:', err)
      setError(msg)
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form className="p-8 bg-white shadow rounded w-full max-w-md" onSubmit={handle}>
        <h2 className="text-2xl font-bold mb-6">Sign In</h2>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <input 
          className="block w-full border p-2 mb-3 rounded" 
          placeholder="Email" 
          type="email"
          value={email} 
          onChange={e=>setEmail(e.target.value)}
          required
        />
        <input 
          className="block w-full border p-2 mb-6 rounded" 
          placeholder="Password" 
          type="password" 
          value={password} 
          onChange={e=>setPassword(e.target.value)}
          required
        />
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p className="text-center mt-4 text-sm">
          Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link>
        </p>
      </form>
    </div>
  )
}
