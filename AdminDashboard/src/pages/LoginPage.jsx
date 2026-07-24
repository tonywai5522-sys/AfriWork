import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../services/adminService.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await adminLogin(email, password)
      localStorage.setItem('admin_token', res.data?.token || res.token)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border-2 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
        <div className="text-center mb-8">
          <span className="text-4xl">🌍</span>
          <h1 className="mt-3 text-2xl font-black tracking-tight">AfriWork Admin</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage the platform</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border-2 border-red-400 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@afriwork.com"
              required
              className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 transition-colors"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,0.3)] hover:bg-slate-800 disabled:opacity-50 transition-all"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Only authorized administrators can access this panel.
        </p>
      </div>
    </div>
  )
}
