import { useState } from 'react'
import * as chatService from '../../services/chatService.js'

export default function NewConversationModal({ isOpen, onClose, onConversationCreated }) {
  const [tab, setTab] = useState('direct')
  const [recipientId, setRecipientId] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [groupTitle, setGroupTitle] = useState('')
  const [participantsInput, setParticipantsInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  async function handleCreateDirect() {
    if (!recipientId && !recipientEmail) {
      setError('Enter a user ID or email')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await chatService.createDirectConversation(recipientId, recipientName, recipientEmail)
      onConversationCreated?.(res.data?.conversation)
      onClose()
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  async function handleCreateGroup() {
    if (!groupTitle.trim()) {
      setError('Group title is required')
      return
    }
    const participantsList = participantsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(id => ({ userId: id, name: '', email: '' }))

    if (participantsList.length < 2) {
      setError('Add at least 2 participant IDs')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await chatService.createGroupConversation({
        title: groupTitle,
        participants: participantsList,
      })
      onConversationCreated?.(res.data?.conversation)
      onClose()
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">New Conversation</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 flex rounded-xl border-2 border-slate-200">
          <button
            onClick={() => setTab('direct')}
            className={`flex-1 rounded-xl py-2 text-sm font-bold transition-all ${
              tab === 'direct' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Direct
          </button>
          <button
            onClick={() => setTab('group')}
            className={`flex-1 rounded-xl py-2 text-sm font-bold transition-all ${
              tab === 'group' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Group
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border-2 border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {tab === 'direct' ? (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600">User ID</label>
              <input
                type="text"
                value={recipientId}
                onChange={e => setRecipientId(e.target.value)}
                placeholder="Enter user ID..."
                className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm font-medium outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600">Name (optional)</label>
              <input
                type="text"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                placeholder="Enter name..."
                className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm font-medium outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600">Email (optional)</label>
              <input
                type="email"
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                placeholder="Enter email..."
                className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm font-medium outline-none focus:border-slate-900"
              />
            </div>
            <button
              onClick={handleCreateDirect}
              disabled={loading}
              className="w-full rounded-xl border-2 border-slate-900 bg-slate-900 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Start Conversation'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600">Group Title</label>
              <input
                type="text"
                value={groupTitle}
                onChange={e => setGroupTitle(e.target.value)}
                placeholder="Enter group name..."
                className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm font-medium outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600">Participants (comma-separated IDs)</label>
              <textarea
                value={participantsInput}
                onChange={e => setParticipantsInput(e.target.value)}
                placeholder="user_id_1, user_id_2, user_id_3"
                rows={3}
                className="w-full resize-none rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm font-medium outline-none focus:border-slate-900"
              />
            </div>
            <button
              onClick={handleCreateGroup}
              disabled={loading}
              className="w-full rounded-xl border-2 border-slate-900 bg-slate-900 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
