import { useState, useRef } from 'react'

export default function ResumeUpload({ resume, onUpload, onDelete, onDownload, uploading }) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  function handleFileSelect(event) {
    const file = event.target.files?.[0]
    if (file) uploadFile(file)
  }

  function uploadFile(file) {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf',
    ]
    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF, DOC, DOCX, TXT, and RTF files are allowed.')
      return
    }
    onUpload(file)
  }

  function handleDrop(event) {
    event.preventDefault()
    setDragOver(false)
    const file = event.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  function handleDragOver(event) {
    event.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave() {
    setDragOver(false)
  }

  function formatFileSize(bytes) {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const hasResume = resume && resume.url

  return (
    <div className="space-y-4">
      <div
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
          dragOver
            ? 'border-slate-900 bg-slate-50'
            : hasResume
              ? 'border-emerald-400 bg-emerald-50'
              : 'border-slate-300 bg-white'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {hasResume ? (
          <div className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-100">
              <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{resume.name}</p>
              <p className="text-xs text-slate-500">Ready for download</p>
            </div>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={onDownload}
                className="rounded-xl border-2 border-emerald-500 bg-emerald-500 px-4 py-1.5 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(16,185,129,1)] transition-all hover:bg-emerald-600 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                Download CV
              </button>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-xl border-2 border-slate-300 bg-white px-4 py-1.5 text-xs font-bold text-slate-600 transition-all hover:border-slate-900 hover:text-slate-900"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={uploading}
                className="rounded-xl border-2 border-red-400 bg-white px-4 py-1.5 text-xs font-bold text-red-600 transition-all hover:bg-red-50 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-slate-300 bg-slate-100">
              <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Upload your CV/Resume</p>
              <p className="text-xs text-slate-500">PDF, DOC, DOCX, TXT, RTF. Max 10MB.</p>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="rounded-xl border-2 border-slate-900 bg-slate-900 px-6 py-2 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Select File'}
            </button>
          </div>
        )}

        {uploading && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
            <span className="text-xs font-medium text-slate-600">Uploading...</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.rtf"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
      {!hasResume && (
        <p className="text-center text-xs text-slate-400">Drag and drop your resume file here, or click to browse.</p>
      )}
    </div>
  )
}
