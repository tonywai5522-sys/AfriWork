import StarRating from './StarRating.jsx'

export default function RatingSummary({ stats, loading }) {
  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border-2 border-slate-200 bg-white p-6">
        <div className="mb-4 h-5 w-32 rounded bg-slate-200" />
        <div className="h-20 rounded bg-slate-100" />
      </div>
    )
  }

  if (!stats || stats.count === 0) {
    return (
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 text-center">
        <p className="text-sm font-bold text-slate-900">No reviews yet</p>
        <p className="mt-1 text-xs text-slate-500">Be the first to leave a review</p>
      </div>
    )
  }

  const { average, count, distribution, recommendedCount } = stats

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-5xl font-black text-slate-900">{average}</p>
          <StarRating rating={Math.round(average)} size="sm" />
          <p className="mt-1 text-xs text-slate-500">{count} review{count !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map(star => {
            const pct = distribution[star] ? (distribution[star] / count) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-4 font-bold text-slate-600">{star}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-right text-slate-400">{distribution[star] || 0}</span>
              </div>
            )
          })}
        </div>
      </div>
      {recommendedCount !== undefined && (
        <p className="mt-3 text-center text-xs text-slate-500">
          {Math.round((recommendedCount / count) * 100)}% of reviewers recommend this
        </p>
      )}
    </div>
  )
}
