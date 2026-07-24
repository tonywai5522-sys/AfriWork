const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

class ApplicationError extends Error {
  constructor(m, s) { super(m); this.name = 'ApplicationError'; this.status = s }
}

async function req(path, opts = {}) {
  const c = { headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) }, credentials: 'include', ...opts }
  let r
  try { r = await fetch(`${API}${path}`, c) } catch { throw new ApplicationError('Connection failed', 0) }
  let p
  try { p = await r.json() } catch { throw new ApplicationError('Invalid response', r.status) }
  if (!r.ok) throw new ApplicationError(p.message || 'Request failed', r.status)
  return p
}

// ─── Applicant ─────────────────────────────────────────
export async function createApplication(data) { return req('/applications', { method: 'POST', body: JSON.stringify(data) }) }
export async function getMyApplications(params = {}) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== null) q.set(k, v) })
  return req(`/applications/mine?${q}`)
}
export async function withdrawApplication(id) { return req(`/applications/${id}/withdraw`, { method: 'POST' }) }
export async function updateApplication(id, data) { return req(`/applications/${id}`, { method: 'PUT', body: JSON.stringify(data) }) }
export async function deleteApplication(id) { return req(`/applications/${id}`, { method: 'DELETE' }) }

// ─── Employer ──────────────────────────────────────────
export async function getEmployerApplications(params = {}) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== null) q.set(k, v) })
  return req(`/applications/employer?${q}`)
}
export async function getJobApplications(jobId, params = {}) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== null) q.set(k, v) })
  return req(`/applications/job/${jobId}?${q}`)
}
export async function reviewApplication(id, data) { return req(`/applications/${id}/review`, { method: 'PUT', body: JSON.stringify(data) }) }
export async function bulkReviewApplications(data) { return req('/applications/bulk-review', { method: 'POST', body: JSON.stringify(data) }) }
export async function getApplicationStats() { return req('/applications/employer/stats') }

// ─── Shared ────────────────────────────────────────────
export async function getApplicationById(id) { return req(`/applications/${id}`) }
