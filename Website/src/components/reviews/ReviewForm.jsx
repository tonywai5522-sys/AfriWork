import { useState, useEffect } from 'react'
import StarRating from './StarRating.jsx'
import * as reviewService from '../../services/reviewService.js'

export default function ReviewForm({ targetType, targetId, onSubmitted, onCancel }) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [pros, setPros] = useState('')
  const [cons, setCons] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isRecommended, setIsRecommended] = useState(true)
  const [existing, setExisting] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function checkExisting() {
      try {
        const res = await reviewService.getMyReview(targetType, targetId)
        if (res.data?.review) {
          const r = res.data.review
          setExisting(r)
          setRating(r.rating)
          setTitle(r.title || '')
          setBody(r.body || '')
          setPros(r.pros || '')
          setCons(r.cons || '')
          setIsAnonymous(r.isAnonymous || false)
          setIsRecommended(r.isRecommended !== false)
        }
      } catch { /* */ }
      setLoading(false)
    }
    checkExisting()
  }, [targetType, targetId])

  async function handleSubmit(e) {
    e.preventDefault()
    if (rating === 0) { setError('Please select a rating'); return }
    if (!body.trim()) { setError('Please write your review'); return }
    setSaving(true); setError('')

    try {
      if (existing) {
        await reviewService.updateReview(existing.id, { rating, title, body, pros, cons, isAnonymous, isRecommended })
      } else {
        await reviewService.createReview({ targetType, targetId, rating, title, body, pros, cons, isAnonymous, isRecommended })
      }
      onSubmitted?.()
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  if (loading) return <div className="h-20 animate-pulse rounded-2xl bg-slate-50" />

  return (
    <div className="rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
      <h3 className="mb-4 text-sm font-bold text-slate-900">
        {existing ? 'Edit Your Review' : 'Write a Review'}
      </h3>

      {error && (
        <div className="mb-4 rounded-xl border-2 border-red-300 bg-red-50 px-4 py-2 text-xs font-medium text-red-600">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">Rating *</label>
          <StarRating rating={rating} size="lg" interactive onChange={setRating} />
          {rating > 0 && (
            <span className="ml-2 text-xs text-slate-400">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
            </span>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">Title (optional)</label>
          <input
            type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">Review *</label>
          <textarea
            value={body} onChange={e => setBody(e.target.value)}
            rows={4}
            placeholder="Share your experience working with this talent/employer..."
            className="w-full resize-none rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Pros (optional)</label>
            <textarea
              value={pros} onChange={e => setPros(e.target.value)}
              rows={2} placeholder="What went well?"
              className="w-full resize-none rounded-xl border-2 border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Cons (optional)</label>
            <textarea
              value={cons} onChange={e => setCons(e.target.value)}
              rows={2} placeholder="What could improve?"
              className="w-full resize-none rounded-xl border-2 border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-900"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300" />
            Post anonymously
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <input type="checkbox" checked={isRecommended} onChange={e => setIsRecommended(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300" />
            I recommend
          </label>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-200 pt-4">
          <button type="submit" disabled={saving}
            className="rounded-xl border-2 border-slate-900 bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-50">
            {saving ? 'Submitting...' : existing ? 'Update Review' : 'Submit Review'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel}
              className="rounded-xl border-2 border-slate-300 bg-white px-6 py-2.5 text-xs font-bold text-slate-600 hover:border-slate-900">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
