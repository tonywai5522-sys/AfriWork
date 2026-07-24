import { useState } from 'react'

export default function DataTable({
  columns,
  data,
  loading,
  emptyMessage = 'No data found',
  onSort,
  sortKey,
  sortOrder,
}) {
  const [selected, setSelected] = useState(new Set())

  function toggleAll() {
    if (selected.size === data.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(data.map((_, i) => i)))
    }
  }

  function toggle(i) {
    const next = new Set(selected)
    if (next.has(i)) next.delete(i)
    else next.add(i)
    setSelected(next)
  }

  function handleSort(key) {
    if (onSort) {
      onSort(key, sortKey === key && sortOrder === 'asc' ? 'desc' : 'asc')
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 rounded-xl border-2 border-slate-200 bg-white animate-pulse" />
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white py-12 text-center">
        <p className="text-sm text-slate-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border-2 border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b-2 border-slate-200 bg-slate-50">
            <th className="px-4 py-3 w-10">
              <input
                type="checkbox"
                checked={selected.size === data.length && data.length > 0}
                onChange={toggleAll}
                className="rounded border-slate-300"
              />
            </th>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:text-slate-900 select-none' : ''}`}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span className="text-[10px]">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id || i}
              className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${selected.has(i) ? 'bg-blue-50' : ''}`}
            >
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.has(i)}
                  onChange={() => toggle(i)}
                  className="rounded border-slate-300"
                />
              </td>
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Pagination({ page, total, limit, onPageChange }) {
  const totalPages = Math.ceil(total / limit) || 1

  return (
    <div className="mt-4 flex items-center justify-center gap-3">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-xs font-bold disabled:opacity-40 hover:border-slate-300 transition-colors"
      >
        ← Prev
      </button>
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const start = Math.max(1, Math.min(page - 2, totalPages - 4))
          const p = start + i
          if (p > totalPages) return null
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                p === page
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          )
        })}
      </div>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-xs font-bold disabled:opacity-40 hover:border-slate-300 transition-colors"
      >
        Next →
      </button>
      <span className="text-[10px] text-slate-400 ml-2">
        {total} total
      </span>
    </div>
  )
}
