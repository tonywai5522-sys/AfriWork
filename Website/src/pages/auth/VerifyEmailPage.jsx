import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { ROUTES } from '../../constants/routes.js'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const { confirmVerification, sendVerification, user } = useAuth()
  const navigate = useNavigate()

  const userId = searchParams.get('userId') || searchParams.get('user_id')
  const secret = searchParams.get('secret')

  const isConfirming = userId && secret

  useEffect(() => {
    async function confirm() {
      setLoading(true)
      try {
        const response = await confirmVerification(userId, secret)
        setMessage(response?.message || 'Email verified successfully!')
        setTimeout(() => navigate(ROUTES.dashboard, { replace: true }), 2000)
      } catch (err) {
        setError(err.message || 'Verification failed. The link may have expired.')
      } finally {
        setLoading(false)
      }
    }

    if (isConfirming) {
      confirm()
    }
  }, [])

  async function handleResend() {
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const response = await sendVerification()
      setVerificationSent(true)
      setMessage(response?.message || 'Verification email sent. Check your inbox.')
    } catch (err) {
      setError(err.message || 'Failed to send verification email')
    } finally {
      setLoading(false)
    }
  }

  if (isConfirming) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-6 py-16">
        <div className="w-full rounded-2xl border-2 border-slate-900 bg-white p-8 text-center shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
          {loading && (
            <>
              <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
              <h1 className="text-2xl font-black text-slate-900">Verifying Email...</h1>
              <p className="mt-2 text-slate-600">Please wait while we verify your email address.</p>
            </>
          )}

          {message && !loading && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-50">
                <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h1 className="text-2xl font-black text-emerald-700">Verified!</h1>
              <p className="mt-2 text-slate-600">{message}</p>
              <p className="mt-1 text-xs text-slate-400">Redirecting to dashboard...</p>
            </>
          )}

          {error && !loading && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-500 bg-red-50">
                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-black text-red-700">Verification Failed</h1>
              <p className="mt-2 text-slate-600">{error}</p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="w-full rounded-xl border-2 border-slate-900 bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-800 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
                >
                  Resend Verification Email
                </button>
                <Link
                  to={ROUTES.dashboard}
                  className="block w-full rounded-xl border-2 border-slate-900 px-6 py-3 text-sm font-bold text-slate-900 transition-all hover:bg-slate-100"
                >
                  Go to Dashboard
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-6 py-16">
      <div className="w-full rounded-2xl border-2 border-slate-900 bg-white p-8 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-100">
            <svg className="h-8 w-8 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Verify Your Email
          </h1>
          <p className="mt-2 text-slate-600">
            {verificationSent
              ? 'Check your inbox for the verification link'
              : 'Click the button below to receive a verification email'}
          </p>
          {user?.email && (
            <p className="mt-1 text-sm font-medium text-slate-900">{user.email}</p>
          )}
        </div>

        {message && (
          <div className="mb-5 rounded-xl border-2 border-emerald-500 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-medium text-emerald-700">{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleResend}
            disabled={loading || verificationSent}
            className="w-full rounded-xl border-2 border-slate-900 bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-800 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50"
          >
            {loading ? 'Sending...' : verificationSent ? 'Email Sent' : 'Send Verification Email'}
          </button>

          <Link
            to={ROUTES.dashboard}
            className="block w-full rounded-xl border-2 border-slate-900 px-6 py-3 text-center text-sm font-bold text-slate-900 transition-all hover:bg-slate-100"
          >
            Skip for now
          </Link>
        </div>
      </div>
    </div>
  )
}
