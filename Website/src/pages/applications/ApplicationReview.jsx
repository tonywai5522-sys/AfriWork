import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/dashboard/DashboardLayout.jsx'
import StatusBadge from '../../components/applications/StatusBadge.jsx'
import * as applicationService from '../../services/applicationService.js'
import { formatDate } from '../../utils/formatDate.js'

const STATUS_ACTIONS = [
  { value: 'reviewed', label: 'Mark Reviewed', color: 'bg-blue-100 text-blue-800 border-blue-300 hover:border-blue-500' },
  { value: 'accepted', label: 'Accept Application', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:border-emerald-500' },
  { value: 'rejected', label: 'Reject Application', color: 'bg-red-100 text-red-800 border-red-300 hover:border-red-500' },
]

export default function ApplicationReview() {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [isEmployerView, setIsEmployerView] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await applicationService.getApplicationById(applicationId)
        const app = res.data.application
        setApplication(app)
        setReviewNotes(app.reviewNotes || '')
        // Check if viewing as employer (based on URL path)
        setIsEmployerView(window.location.pathname.startsWith('/employer'))
      } catch (err) {
        setError(err.message || 'Failed to load application')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [applicationId])

  async function handleStatusUpdate(status) {
    if (updating) return
    setUpdating(true)
    try {
      const res = await applicationService.reviewApplication(applicationId, {
        status,
        reviewNotes: reviewNotes || undefined,
      })
      setApplication(res.data.application)
    } catch (err) {
      setError(err.message || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="mb-6 h-8 w-64 animate-pulse rounded bg-slate-200" />
          <div className="h-96 animate-pulse rounded-2xl border-2 border-slate-200 bg-slate-50" />
        </div>
      </DashboardLayout>
    )
  }

  if (error && !application) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-8 text-center">
            <p className="text-lg font-bold text-red-700">{error}</p>
            <button onClick={() => navigate(-1)} className="mt-4 rounded-xl border-2 border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-700">
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!application) return null

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Back */}
        <button
          onClick={() => navigate(isEmployerView ? '/employer/applications' : '/applications')}
          className="mb-6 flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900"
        >
          ← Back to {isEmployerView ? 'All Applications' : 'My Applications'}
        </button>

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900">{application.jobTitle}</h1>
              <StatusBadge status={application.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Applied {formatDate(application.createdAt)}
              {application.proposedRate > 0 && ` · Proposed: ${application.currency} ${application.proposedRate}`}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Cover Letter */}
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
              <h2 className="mb-3 text-sm font-black text-slate-900">Cover Letter</h2>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {application.coverLetter || 'No cover letter provided.'}
              </div>
            </div>

            {/* Employer Review Panel */}
            {isEmployerView && (
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
                <h2 className="mb-3 text-sm font-black text-slate-900">Your Review</h2>

                {/* Review Notes */}
                <div className="mb-4">
                  <label htmlFor="reviewNotes" className="mb-1 block text-xs font-bold text-slate-700">
                    Review Notes
                  </label>
                  <textarea
                    id="reviewNotes"
                    rows={4}
                    placeholder="Add private notes about this applicant..."
                    value={reviewNotes}
                    onChange={e => setReviewNotes(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Status Actions */}
                <div className="flex flex-wrap gap-3">
                  {STATUS_ACTIONS.map(action => (
                    <button
                      key={action.value}
                      onClick={() => handleStatusUpdate(action.value)}
                      disabled={updating || application.status === action.value}
                      className={`rounded-xl border-2 px-5 py-2.5 text-xs font-bold transition-all disabled:opacity-40 ${action.color} ${
                        application.status === action.value ? 'opacity-60' : 'active:translate-x-[1px] active:translate-y-[1px]'
                      }`}
                    >
                      {updating ? 'Updating...' : action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Applicant Info */}
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-xs font-black text-slate-900 uppercase tracking-wider">Applicant</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-500">Name</p>
                  <p className="text-sm font-bold text-slate-900">{application.applicantName || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <a href={`mailto:${application.applicantEmail}`} className="text-sm font-bold text-blue-700 hover:underline">
                    {application.applicantEmail || 'Not provided'}
                  </a>
                </div>
                {application.applicantPhone && (
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-sm font-bold text-slate-900">{application.applicantPhone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Attachments */}
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-xs font-black text-slate-900 uppercase tracking-wider">Attachments</h3>
              <div className="space-y-2">
                {application.resumeUrl ? (
                  <a
                    href={application.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:border-slate-400"
                  >
                    <span>📄</span>
                    <span>View Resume</span>
                  </a>
                ) : (
                  <p className="text-xs text-slate-500">No resume attached</p>
                )}
                {application.portfolioUrl && (
                  <a
                    href={application.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:border-slate-400"
                  >
                    <span>🔗</span>
                    <span>View Portfolio</span>
                  </a>
                )}
              </div>
            </div>

            {/* Proposed Rate */}
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-xs font-black text-slate-900 uppercase tracking-wider">Proposed Rate</h3>
              <p className="text-lg font-black text-slate-900">
                {application.proposedRate > 0
                  ? `${application.currency} ${application.proposedRate.toLocaleString()}`
                  : 'Not specified'}
              </p>
            </div>

            {/* Timeline */}
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-xs font-black text-slate-900 uppercase tracking-wider">Timeline</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Applied</span>
                  <span className="font-bold text-slate-700">{formatDate(application.createdAt)}</span>
                </div>
                {application.reviewedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reviewed</span>
                    <span className="font-bold text-slate-700">{formatDate(application.reviewedAt)}</span>
                  </div>
                )}
                {application.status === 'accepted' || application.status === 'rejected' ? (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Decided</span>
                    <span className="font-bold text-slate-700">{formatDate(application.updatedAt)}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
