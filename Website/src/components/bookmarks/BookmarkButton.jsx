import { useBookmarkContext } from '../../context/BookmarkContext.jsx'

export default function BookmarkButton({ targetType, targetId, size = 'sm', onToggle }) {
  const { isSaved, toggleSave } = useBookmarkContext()
  const bookmarked = isSaved(targetType, targetId)

  async function handleClick(e) {
    e.preventDefault()
    e.stopPropagation()
    await toggleSave(targetType, targetId)
    onToggle?.()
  }

  const sizeClasses = { xs: 'h-7 w-7', sm: 'h-8 w-8', md: 'h-9 w-9', lg: 'h-10 w-10' }
  const iconSizes = { xs: 'h-3.5 w-3.5', sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-5 w-5' }

  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-xl border-2 transition-all ${
        bookmarked
          ? 'border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100'
          : 'border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600'
      }`}
      title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <svg className={iconSizes[size]} fill={bookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
      </svg>
    </button>
  )
}
