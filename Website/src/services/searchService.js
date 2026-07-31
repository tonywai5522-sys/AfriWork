import { API_BASE } from './apiClient.js'

class SearchError extends Error {
  constructor(m, s) { super(m); this.name = 'SearchError'; this.status = s }
}

async function req(path, opts = {}) {
  const c = { headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) }, credentials: 'include', ...opts }
  let r
  try { r = await fetch(`${API_BASE}${path}`, c) } catch { throw new SearchError('Connection failed', 0) }
  let p
  try { p = await r.json() } catch { throw new SearchError('Invalid response', r.status) }
  if (!r.ok) throw new SearchError(p.message || 'Request failed', r.status)
  return p
}

export async function globalSearch(params = {}) {
  return req('/search', {
    method: 'POST',
    body: JSON.stringify({
      query: params.query || '',
      type: params.type || 'all',
      filters: params.filters || {},
      page: params.page || 1,
      limit: params.limit || 10,
      sortBy: params.sortBy || 'relevance',
    }),
  })
}

export async function getRecentSearches() {
  return req('/search/recent')
}

export async function saveRecentSearch(data) {
  return req('/search/recent', {
    method: 'POST',
    body: JSON.stringify({
      query: data.query,
      type: data.type || 'all',
      results: data.results || 0,
    }),
  })
}

export async function clearRecentSearches() {
  return req('/search/recent', { method: 'DELETE' })
}

export async function deleteRecentSearch(searchId) {
  return req(`/search/recent/${searchId}`, { method: 'DELETE' })
}
