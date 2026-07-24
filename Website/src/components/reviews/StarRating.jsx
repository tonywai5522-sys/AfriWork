export default function StarRating({ rating = 0, size = 'sm', interactive = false, onChange, showValue = false }) {
  const stars = [1, 2, 3, 4, 5]
  const sizeClasses = { xs: 'h-3 w-3', sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-7 w-7' }
  const s = sizeClasses[size] || sizeClasses.sm

  return (
    <div className="flex items-center gap-0.5">
      {stars.map(star => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <svg className={`${s} ${star <= rating ? 'text-amber-400' : 'text-slate-200'}`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-bold text-slate-700">{rating.toFixed(1)}</span>
      )}
    </div>
  )
}
