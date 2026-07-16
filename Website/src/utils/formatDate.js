export function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
