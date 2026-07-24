import { useState, useRef, useCallback } from 'react'
import { useSocket } from '../../context/SocketContext.jsx'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/zip']

export default function MessageInput({ conversationId, onSendMessage, disabled }) {
  const [content, setContent] = useState('')
  const [files, setFiles] = useState([])
  const [sending, setSending] = useState(false)
  const typingTimeoutRef = useRef(null)
  const fileInputRef = useRef(null)
  const { emit } = useSocket()

  const emitTyping = useCallback((start) => {
    if (!conversationId) return
    emit(start ? 'chat:typing_start' : 'chat:typing_stop', { conversationId })
  }, [conversationId, emit])

  function handleChange(e) {
    setContent(e.target.value)

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    emitTyping(true)
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 2000)
  }

  function handleFileSelect(e) {
    const selected = Array.from(e.target.files || [])
    const valid = selected.filter(f => ALLOWED_TYPES.includes(f.type) && f.size <= 10 * 1024 * 1024)
    setFiles(prev => [...prev, ...valid].slice(0, 5))
    e.target.value = ''
  }

  function removeFile(index) {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if ((!content.trim() && files.length === 0) || sending || disabled || !conversationId) return

    emitTyping(false)
    setSending(true)

    try {
      await onSendMessage(content.trim(), files)
      setContent('')
      setFiles([])
    } catch {
      // error handled by parent
    }
    setSending(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="border-t-2 border-slate-200 bg-white px-4 py-3">
      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border-2 border-slate-200 bg-slate-50 px-3 py-1.5">
              <span className="max-w-[120px] truncate text-xs font-medium text-slate-700">{file.name}</span>
              <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-slate-300 text-slate-500 transition-all hover:border-slate-900 hover:text-slate-900"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.txt,.zip"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="relative flex-1">
          <textarea
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            disabled={disabled}
            className="w-full resize-none rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900 disabled:opacity-50"
            style={{ minHeight: 42, maxHeight: 120 }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
          />
        </div>
        <button
          type="submit"
          disabled={(!content.trim() && files.length === 0) || sending || disabled}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-slate-900 bg-slate-900 text-white transition-all hover:bg-slate-700 disabled:opacity-40"
        >
          {sending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          )}
        </button>
      </form>
    </div>
  )
}
