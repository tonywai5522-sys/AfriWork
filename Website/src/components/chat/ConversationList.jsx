import { useState, useEffect } from 'react'
import * as chatService from '../../services/chatService.js'
import { useSocket } from '../../context/SocketContext.jsx'
import { useAuth } from '../../hooks/useAuth.js'

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function ConversationList({ selectedId, onSelect, onStartNew }) {
  const { user } = useAuth()
  const { isUserOnline } = useSocket()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadConversations()
  }, [])

  async function loadConversations() {
    setLoading(true)
    try {
      const res = await chatService.getConversations()
      setConversations(res.data?.conversations || [])
    } catch {
      setConversations([])
    }
    setLoading(false)
  }

  function getConversationName(conv) {
    if (conv.title) return conv.title
    const other = (conv.participants || []).find(p => p.userId !== user.id)
    return other?.name || other?.email || 'Unknown'
  }

  function getConversationAvatar(conv) {
    if (conv.avatar) return conv.avatar
    if (conv.type === 'direct') {
      const other = (conv.participants || []).find(p => p.userId !== user.id)
      return other?.avatarUrl || ''
    }
    return ''
  }

  function getLastMessagePreview(conv) {
    if (!conv.lastMessage) return 'No messages yet'
    const content = conv.lastMessage.content || ''
    if (conv.lastMessage.attachments?.length > 0) {
      return `📎 ${content || 'Attachment'}`
    }
    return content
  }

  const filtered = conversations.filter(c => {
    if (!searchQuery) return true
    const name = getConversationName(c).toLowerCase()
    return name.includes(searchQuery.toLowerCase())
  })

  return (
    <div className="flex h-full flex-col border-r-2 border-slate-200 bg-white">
      <div className="border-b-2 border-slate-200 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Messages</h2>
          <button
            onClick={onStartNew}
            className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-slate-900 bg-slate-900 text-white transition-all hover:bg-slate-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border-2 border-slate-300 py-2 pl-10 pr-3 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-medium text-slate-500">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            <button onClick={onStartNew} className="mt-2 text-sm font-bold text-slate-900 underline">
              Start a new conversation
            </button>
          </div>
        ) : (
          filtered.map(conv => {
            const isSelected = conv.id === selectedId
            const otherUserId = conv.type === 'direct'
              ? (conv.participants || []).find(p => p.userId !== user.id)?.userId
              : null
            const online = otherUserId ? isUserOnline(otherUserId) : false

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full border-b border-slate-100 px-4 py-3 text-left transition-all hover:bg-slate-50 ${
                  isSelected ? 'bg-slate-100' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-100 text-sm font-bold text-slate-600">
                      {getConversationAvatar(conv) ? (
                        <img src={getConversationAvatar(conv)} alt="" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        getConversationName(conv)[0]?.toUpperCase() || '?'
                      )}
                    </div>
                    {online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {getConversationName(conv)}
                      </p>
                      {conv.lastMessage && (
                        <span className="ml-2 shrink-0 text-xs font-medium text-slate-400">
                          {formatTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                      {getLastMessagePreview(conv)}
                    </p>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
