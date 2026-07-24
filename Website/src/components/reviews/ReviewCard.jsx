import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import StarRating from './StarRating.jsx'
import * as reviewService from '../../services/reviewService.js'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr); const n = new Date(); const diff = n - d
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

export default function ReviewCard({ review, onDeleted, onHelpfulChanged }) {
  const { user } = useAuth()
  const [helpfulState, setHelpfulState] = useState(null)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  const isOwner = review.reviewerId === user?.id
  const isTargetOwner = review.targetId === user?.id
  const isAdmin = user?.role === 'admin'

  async function handleHelpful() {
    try {
      const res = await reviewService.markHelpful(review.id)
      setHelpfulState(res.data)
      onHelpfulChanged?.(review.id, res.data)
    } catch { /* */ }
  }

  async function handleDelete() {
    if (!confirm('Delete this review?')) return
    try {
      await reviewService.deleteReview(review.id)
      onDeleted?.(review.id)
    } catch { /* */ }
  }

  async function handleReply(e) {
    e.preventDefault()
    if (!replyText.trim()) return
    setSendingReply(true)
    try {
      await reviewService.addReply(review.id, replyText)
      setReplyText('')
      setShowReplyForm(false)
    } catch { /* */ }
    setSendingReply(false)
  }

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-100 text-xs font-bold text-slate-600">
            {review.reviewerName?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{review.reviewerName}</p>
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} size="xs" />
              <span className="text-[10px] text-slate-400">{timeAgo(review.createdAt)}</span>
              {review.editedAt && <span className="text-[10px] text-slate-400">· edited</span>}
            </div>
          </div>
        </div>
        {review.status !== 'approved' && isAdmin && (
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
            review.status === 'pending' ? 'border-amber-200 bg-amber-50 text-amber-700' :
            review.status === 'flagged' ? 'border-red-200 bg-red-50 text-red-700' :
            'border-slate-200 bg-slate-50 text-slate-600'
          }`}>{review.status}</span>
        )}
      </div>

      {review.title && <h4 className="mt-3 text-sm font-bold text-slate-900">{review.title}</h4>}
      <p className="mt-1 text-sm text-slate-700 leading-relaxed">{review.body}</p>

      {(review.pros || review.cons) && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {review.pros && (
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3">
              <p className="text-[10px] font-bold text-emerald-700 uppercase">Pros</p>
              <p className="mt-0.5 text-xs text-emerald-800">{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-3">
              <p className="text-[10px] font-bold text-red-700 uppercase">Cons</p>
              <p className="mt-0.5 text-xs text-red-800">{review.cons}</p>
            </div>
          )}
        </div>
      )}

      {review.isRecommended !== undefined && (
        <p className="mt-2 text-xs text-slate-500">
          {review.isRecommended ? '✅ Recommends' : '❌ Does not recommend'}
        </p>
      )}

      {/* Reply */}
      {review.reply && (
        <div className="mt-3 rounded-xl border-2 border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-bold text-slate-600 uppercase">Response</p>
          <p className="mt-0.5 text-xs text-slate-700">{review.reply.body}</p>
        </div>
      )}

      <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3">
        <button onClick={handleHelpful} className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900">
          <svg className={`h-4 w-4 ${helpfulState?.helpful ? 'text-blue-500' : ''}`} fill={helpfulState?.helpful ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48a4.507 4.507 0 01-2.416-.72M6.633 10.5a3 3 0 01-.633-2.041m.633 2.041H4.5a.75.75 0 01-.75-.75V6.75a.75.75 0 01.75-.75h2.25a.75.75 0 01.75.75v3.75zm0 0v3.75a.75.75 0 01-.75.75h-1.5" />
          </svg>
          Helpful ({helpfulState?.count ?? review.helpfulCount ?? 0})
        </button>

        {isTargetOwner && !review.reply && (
          <button onClick={() => setShowReplyForm(!showReplyForm)} className="text-xs font-medium text-slate-500 hover:text-slate-900">
            Reply
          </button>
        )}

        {(isOwner || isAdmin) && (
          <button onClick={handleDelete} className="ml-auto text-xs font-medium text-red-500 hover:text-red-700">
            Delete
          </button>
        )}
      </div>

      {showReplyForm && (
        <form onSubmit={handleReply} className="mt-3 flex gap-2">
          <input
            type="text"
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Write a response..."
            className="flex-1 rounded-xl border-2 border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-900"
          />
          <button type="submit" disabled={sendingReply || !replyText.trim()}
            className="rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-50">
            {sendingReply ? '...' : 'Send'}
          </button>
        </form>
      )}
    </div>
  )
}
