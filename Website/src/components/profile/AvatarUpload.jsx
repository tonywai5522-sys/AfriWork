import { useState, useRef } from 'react'

export default function AvatarUpload({ currentUrl, onUpload, onDelete, uploading }) {
  const [preview, setPreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  function handleFileSelect(event) {
    const file = event.target.files?.[0]
    if (file) previewFile(file)
  }

  function previewFile(file) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)
    onUpload(file)
  }

  function handleDrop(event) {
    event.preventDefault()
    setDragOver(false)
    const file = event.dataTransfer.files?.[0]
    if (file) previewFile(file)
  }

  function handleDragOver(event) {
    event.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave() {
    setDragOver(false)
  }

  const displayUrl = preview || currentUrl

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`relative h-32 w-32 overflow-hidden rounded-full border-2 transition-all ${
          dragOver
            ? 'border-slate-900 bg-slate-100 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]'
            : 'border-slate-300 bg-slate-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-white border-t-transparent" />
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-1.5 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
        >
          {currentUrl ? 'Change' : 'Upload'}
        </button>
        {currentUrl && (
          <button
            type="button"
            onClick={onDelete}
            disabled={uploading}
            className="rounded-xl border-2 border-red-500 bg-white px-4 py-1.5 text-xs font-bold text-red-600 shadow-[2px_2px_0px_0px_rgba(239,68,68,1)] transition-all hover:bg-red-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
          >
            Remove
          </button>
        )}
      </div>
      <p className="text-xs text-slate-400">Click or drag. Max 5MB. JPEG, PNG, GIF, WebP.</p>
    </div>
  )
}
