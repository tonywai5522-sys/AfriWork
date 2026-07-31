import { API_BASE } from './apiClient.js'

class JobError extends Error {
  constructor(m, s) { super(m); this.name = 'JobError'; this.status = s }
}

async function req(path, opts = {}) {
  const c = { headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) }, credentials: 'include', ...opts }
  let r
  try { r = await fetch(`${API_BASE}${path}`, c) } catch { throw new JobError('Connection failed', 0) }
  let p
  try { p = await r.json() } catch { throw new JobError('Invalid response', r.status) }
  if (!r.ok) throw new JobError(p.message || 'Request failed', r.status)
  return p
}

export async function searchJobs(params = {}) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== null) q.set(k, v) })
  return req(`/jobs/search?${q}`)
}
export async function getFeaturedJobs() { return req('/jobs/featured') }
export async function getJobById(id) { return req(`/jobs/${id}`) }
export async function incrementView(id) { return req(`/jobs/${id}/view`, { method: 'POST' }) }
export async function createJob(data) { return req('/jobs', { method: 'POST', body: JSON.stringify(data) }) }
export async function updateJob(id, data) { return req(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }) }
export async function getEmployerJobs() { return req('/jobs/employer/mine') }
export async function getBookmarkedIds() { return req('/jobs/bookmarks/list') }
export async function bookmarkJob(id) { return req('/jobs/bookmarks', { method: 'POST', body: JSON.stringify({ jobId: id }) }) }
export async function unbookmarkJob(id) { return req(`/jobs/bookmarks/${id}`, { method: 'DELETE' }) }
