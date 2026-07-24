import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) return 'Today'
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function MessageBubble({ message, isConsecutive, showDateSeparator }) {
  const { user } = useAuth()
  const isOwn = message.senderId === user?.id
  const [showActions, setShowActions] = useState(false)

  function handleReaction(emoji) {
    if (window.socketEmit) {
      window.socketEmit('chat:add_reaction', { messageId: message.id, emoji })
    }
  }

  return (
    <>
      {showDateSeparator && (
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 border-t border-slate-200" />
          <span className="text-xs font-medium text-slate-400">{formatDate(message.createdAt)}</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>
      )}
      <div
        className={`group flex ${isOwn ? 'justify-end' : 'justify-start'} px-4 ${
          isConsecutive ? 'mt-0.5' : 'mt-2'
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className={`flex max-w-[75%] flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {!isConsecutive && !isOwn && (
            <span className="mb-1 ml-1 text-xs font-bold text-slate-500">{message.senderName}</span>
          )}
          <div className="relative">
            <div
              className={`rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                isOwn
                  ? 'border-2 border-slate-900 bg-slate-900 text-white'
                  : 'border-2 border-slate-200 bg-white text-slate-900'
              }`}
            >
              {message.replyTo && (
                <div className="mb-1 rounded-lg border-l-2 border-slate-400 bg-slate-50 px-2 py-1 text-xs text-slate-500">
                  Replying to a message
                </div>
              )}
              {message.content && (
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              )}
              {message.attachments?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.attachments.map((att, i) => (
                    <div key={att.id || i}>
                      {att.isImage || att.type?.startsWith('image/') ? (
                        <img src={att.url} alt={att.name} className="max-w-[200px] rounded-lg" />
                      ) : (
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                          </svg>
                          <span className="truncate">{att.name}</span>
                          <span className="shrink-0 text-slate-400">{att.sizeFormatted || ''}</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {message.isEdited && (
                <span className="ml-1 text-[10px] opacity-60">(edited)</span>
              )}
            </div>
            <div className={`mt-0.5 flex items-center gap-2 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
              <span className="text-[10px] font-medium text-slate-400">{formatTime(message.createdAt)}</span>
              {isOwn && message.readBy?.length > 1 && (
                <svg className="h-3 w-3 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
            </div>
            {message.reactions?.length > 0 && (
              <div className={`mt-1 flex flex-wrap gap-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                {message.reactions.map((r, i) => (
                  <span key={r.id || i} className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs">
                    {r.emoji}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
