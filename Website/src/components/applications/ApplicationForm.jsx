import { useState } from 'react'
import * as applicationService from '../../services/applicationService.js'
import StatusBadge from './StatusBadge.jsx'

export default function ApplicationForm({ job, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    jobId: job?.id || '',
    coverLetter: '',
    proposedRate: '',
    currency: 'USD',
    portfolioUrl: '',
    resumeUrl: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  function validate() {
    const e = {}
    if (form.coverLetter.trim().length < 20) e.coverLetter = 'Cover letter must be at least 20 characters'
    if (form.coverLetter.length > 8000) e.coverLetter = 'Cover letter must be 8000 characters or less'
    if (form.proposedRate && (isNaN(form.proposedRate) || Number(form.proposedRate) < 0)) e.proposedRate = 'Rate must be a positive number'
    if (form.portfolioUrl && !/^https?:\/\/.+/.test(form.portfolioUrl)) e.portfolioUrl = 'Enter a valid URL (https://...)'
    if (form.resumeUrl && !/^https?:\/\/.+/.test(form.resumeUrl)) e.resumeUrl = 'Enter a valid URL (https://...)'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    const v = validate()
    setErrors(v)
    if (Object.keys(v).length > 0) return

    setSubmitting(true)
    try {
      const payload = {
        ...form,
        proposedRate: form.proposedRate ? Number(form.proposedRate) : 0,
      }
      await applicationService.createApplication(payload)
      setSuccess(true)
      onSuccess?.()
    } catch (err) {
      setServerError(err.message || 'Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  if (success) {
    return (
      <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-100 text-lg font-black text-emerald-700">
          ✓
        </div>
        <h3 className="mb-1 text-lg font-black text-emerald-900">Application Submitted!</h3>
        <p className="mb-4 text-sm text-emerald-700">
          Your application for <strong>{job?.title}</strong> has been received.
        </p>
        <button
          onClick={onCancel}
          className="rounded-xl border-2 border-emerald-400 bg-white px-5 py-2 text-xs font-bold text-emerald-700 shadow-[2px_2px_0px_0px_rgba(5,150,105,1)] transition-all hover:bg-emerald-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {serverError && (
        <div className="rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {serverError}
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-bold text-slate-700">
          Applying for <span className="text-slate-900">{job?.title}</span>
        </label>
        <p className="text-xs text-slate-500">{job?.companyName} · {job?.location || 'Remote'}</p>
      </div>

      {/* Cover Letter */}
      <div>
        <label htmlFor="coverLetter" className="mb-1 block text-xs font-bold text-slate-700">
          Cover Letter <span className="text-red-500">*</span>
        </label>
        <textarea
          id="coverLetter"
          rows={6}
          placeholder="Tell the employer why you're a great fit for this role..."
          value={form.coverLetter}
          onChange={e => handleChange('coverLetter', e.target.value)}
          className={`w-full rounded-xl border-2 px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 ${
            errors.coverLetter ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
          }`}
        />
        {errors.coverLetter && <p className="mt-1 text-xs font-bold text-red-600">{errors.coverLetter}</p>}
        <p className="mt-1 text-right text-[10px] text-slate-400">{form.coverLetter.length}/8000</p>
      </div>

      {/* Proposed Rate */}
      <div>
        <label htmlFor="proposedRate" className="mb-1 block text-xs font-bold text-slate-700">
          Proposed Rate
        </label>
        <div className="flex gap-2">
          <input
            id="proposedRate"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.proposedRate}
            onChange={e => handleChange('proposedRate', e.target.value)}
            className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 ${
              errors.proposedRate ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
            }`}
          />
          <select
            value={form.currency}
            onChange={e => handleChange('currency', e.target.value)}
            className="w-24 rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="KES">KES</option>
            <option value="NGN">NGN</option>
            <option value="ZAR">ZAR</option>
            <option value="GHS">GHS</option>
            <option value="ETB">ETB</option>
          </select>
        </div>
        {errors.proposedRate && <p className="mt-1 text-xs font-bold text-red-600">{errors.proposedRate}</p>}
      </div>

      {/* Resume URL */}
      <div>
        <label htmlFor="resumeUrl" className="mb-1 block text-xs font-bold text-slate-700">
          Resume Link
        </label>
        <input
          id="resumeUrl"
          type="url"
          placeholder="https://drive.google.com/your-resume.pdf"
          value={form.resumeUrl}
          onChange={e => handleChange('resumeUrl', e.target.value)}
          className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 ${
            errors.resumeUrl ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
          }`}
        />
        {errors.resumeUrl && <p className="mt-1 text-xs font-bold text-red-600">{errors.resumeUrl}</p>}
      </div>

      {/* Portfolio URL */}
      <div>
        <label htmlFor="portfolioUrl" className="mb-1 block text-xs font-bold text-slate-700">
          Portfolio Link
        </label>
        <input
          id="portfolioUrl"
          type="url"
          placeholder="https://your-portfolio.com"
          value={form.portfolioUrl}
          onChange={e => handleChange('portfolioUrl', e.target.value)}
          className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 ${
            errors.portfolioUrl ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
          }`}
        />
        {errors.portfolioUrl && <p className="mt-1 text-xs font-bold text-red-600">{errors.portfolioUrl}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-xl border-2 border-slate-900 bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
