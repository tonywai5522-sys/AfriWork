const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

class PortfolioError extends Error {
  constructor(m, s) { super(m); this.name = 'PortfolioError'; this.status = s }
}

async function req(path, opts = {}) {
  const c = { headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) }, credentials: 'include', ...opts }
  let r
  try { r = await fetch(`${API}${path}`, c) } catch { throw new PortfolioError('Connection failed', 0) }
  let p
  try { p = await r.json() } catch { throw new PortfolioError('Invalid response', r.status) }
  if (!r.ok) throw new PortfolioError(p.message || 'Request failed', r.status)
  return p
}

// ─── CRUD ─────────────────────────────────────────────
export async function createProject(data) { return req('/portfolio', { method: 'POST', body: JSON.stringify(data) }) }
export async function updateProject(id, data) { return req(`/portfolio/${id}`, { method: 'PUT', body: JSON.stringify(data) }) }
export async function getProjectById(id) { return req(`/portfolio/${id}`) }
export async function deleteProject(id) { return req(`/portfolio/${id}`, { method: 'DELETE' }) }

// ─── Search ────────────────────────────────────────────
export async function searchProjects(params = {}) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== null) q.set(k, v) })
  return req(`/portfolio/search?${q}`)
}

// ─── My Projects ───────────────────────────────────────
export async function getMyProjects(params = {}) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== null) q.set(k, v) })
  return req(`/portfolio/mine/list?${q}`)
}

// ─── Views ─────────────────────────────────────────────
export async function incrementView(id) { return req(`/portfolio/${id}/view`, { method: 'POST' }) }

// ─── Media ─────────────────────────────────────────────
export async function uploadMedia(file, onProgress) {
  const formData = new FormData()
  formData.append('file', file)
  const xhr = new XMLHttpRequest()
  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (e) => {
      if (onProgress && e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    })
    xhr.addEventListener('load', () => {
      try {
        const p = JSON.parse(xhr.responseText)
        if (xhr.status >= 200 && xhr.status < 300) resolve(p)
        else reject(new PortfolioError(p.message || 'Upload failed', xhr.status))
      } catch { reject(new PortfolioError('Upload failed', xhr.status)) }
    })
    xhr.addEventListener('error', () => reject(new PortfolioError('Upload failed', 0)))
    xhr.open('POST', `${API}/portfolio/media/upload`)
    xhr.withCredentials = true
    xhr.send(formData)
  })
}
export async function deleteMedia(fileId) { return req(`/portfolio/media/${fileId}`, { method: 'DELETE' }) }
