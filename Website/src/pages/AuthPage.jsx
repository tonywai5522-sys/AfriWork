import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { ROUTES } from '../constants/routes.js'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', fullName: '', confirmPassword: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register, forgotPassword } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (mode === 'login') {
        const result = await login(form.email, form.password)
        setMessage(result.message)
        if (result.success) navigate(ROUTES.dashboard)
      } else if (mode === 'register') {
        const result = await register({ ...form })
        setMessage(result.message)
        if (result.success) navigate(ROUTES.dashboard)
      } else if (mode === 'forgot') {
        const result = await forgotPassword(form.email)
        setMessage(result.message)
      }
    } catch (error) {
      setMessage(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex gap-2">
          <button type="button" className={`rounded-full px-3 py-1 text-sm ${mode === 'login' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`} onClick={() => setMode('login')}>Login</button>
          <button type="button" className={`rounded-full px-3 py-1 text-sm ${mode === 'register' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`} onClick={() => setMode('register')}>Register</button>
          <button type="button" className={`rounded-full px-3 py-1 text-sm ${mode === 'forgot' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`} onClick={() => setMode('forgot')}>Forgot</button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <input className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Full name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
          )}

          <input className="w-full rounded-lg border border-slate-300 px-3 py-2" type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          {mode !== 'forgot' && (
            <input className="w-full rounded-lg border border-slate-300 px-3 py-2" type="password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          )}
          {mode === 'register' && (
            <input className="w-full rounded-lg border border-slate-300 px-3 py-2" type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} />
          )}

          <button type="submit" className="w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-60" disabled={loading}>{loading ? 'Please wait...' : mode === 'forgot' ? 'Send reset link' : mode === 'register' ? 'Create account' : 'Sign in'}</button>
        </form>

        {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
      </div>
    </div>
  )
}
