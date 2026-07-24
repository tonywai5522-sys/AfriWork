import { useState } from 'react'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const now = Date.now()
  const d = new Date(dateStr).getTime()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function CommentSection({ comments = [], onAddComment, currentUserName, entityType, entityId }) {
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editContent, setEditContent] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!newComment.trim()) return
    setSubmitting(true)
    try {
      await onAddComment({ content: newComment, entityType, entityId })
      setNewComment('')
    } catch { /* handled upstream */ }
    setSubmitting(false)
  }

  async function handleEdit(commentId) {
    if (!editContent.trim()) return
    setSubmitting(true)
    try {
      await onAddComment({ ...commentId, content: editContent })
      setEditId(null)
      setEditContent('')
    } catch { /* handled upstream */ }
    setSubmitting(false)
  }

  return (
    <div className="rounded-2xl border-2 border-slate-900 bg-white">
      <div className="border-b-2 border-slate-900 px-5 py-3">
        <h3 className="text-sm font-bold text-slate-900">Comments ({comments.length})</h3>
      </div>

      <form onSubmit={handleSubmit} className="border-b-2 border-slate-100 px-5 py-3">
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-900 text-[10px] font-bold text-white">
            {currentUserName?.[0] || 'U'}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={2}
              className="w-full resize-none rounded-xl border-2 border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-1.5 text-xs font-bold text-white transition-all hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Comment'}
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="divide-y-2 divide-slate-100">
        {comments.length === 0 && (
          <p className="px-5 py-8 text-center text-xs text-slate-400">No comments yet. Be the first!</p>
        )}
        {comments.map((comment) => {
          const isEditing = editId === (comment.id || comment._id)
          return (
            <div key={comment.id || comment._id} className="px-5 py-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-100 text-[10px] font-bold text-slate-700">
                  {comment.authorName?.[0] || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{comment.authorName || 'Unknown'}</span>
                    <span className="text-[10px] text-slate-400">{timeAgo(comment.createdAt)}</span>
                  </div>
                  {isEditing ? (
                    <div className="mt-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                        className="w-full resize-none rounded-xl border-2 border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-900"
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => handleEdit(comment.id || comment._id)}
                          disabled={!editContent.trim() || submitting}
                          className="rounded-lg border-2 border-slate-900 bg-slate-900 px-3 py-1 text-[10px] font-bold text-white disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditId(null); setEditContent('') }}
                          className="rounded-lg border-2 border-slate-900 bg-white px-3 py-1 text-[10px] font-bold text-slate-900"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-slate-700">{comment.content}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
