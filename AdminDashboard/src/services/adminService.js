const API_BASE = 'http://localhost:5000/api/v1'

function getToken() {
  return localStorage.getItem('admin_token') || ''
}

async function request(path, opts = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    credentials: 'include',
    ...opts,
  }
  const res = await fetch(`${API_BASE}${path}`, config)
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('admin_token')
    window.location.reload()
    throw new Error('Unauthorized')
  }
  const payload = await res.json()
  if (!res.ok) throw new Error(payload.message || 'Request failed')
  return payload
}

// ─── Auth ──────────────────────────────────────────────

export async function adminLogin(email, password) {
  return request('/auth/admin-login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

// ─── Dashboard Stats ──────────────────────────────────

export async function getDashboardStats() {
  return request('/admin/stats')
}

// ─── User Management ──────────────────────────────────

export async function listUsers(params = {}) {
  const q = new URLSearchParams()
  if (params.query) q.set('query', params.query)
  if (params.role) q.set('role', params.role)
  if (params.status) q.set('status', params.status)
  if (params.sortBy) q.set('sortBy', params.sortBy)
  if (params.sortOrder) q.set('sortOrder', params.sortOrder)
  if (params.page) q.set('page', params.page)
  if (params.limit) q.set('limit', params.limit)
  return request(`/admin/users?${q}`)
}

export async function getUserById(userId) {
  return request(`/admin/users/${userId}`)
}

export async function suspendUser(userId, reason = '') {
  return request(`/admin/users/${userId}/suspend`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  })
}

export async function activateUser(userId) {
  return request(`/admin/users/${userId}/activate`, { method: 'PUT' })
}

export async function updateUserRole(userId, role) {
  return request(`/admin/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  })
}

export async function deleteUser(userId) {
  return request(`/admin/users/${userId}`, { method: 'DELETE' })
}

// ─── Employer Management ──────────────────────────────

export async function listEmployers(params = {}) {
  const q = new URLSearchParams()
  if (params.query) q.set('query', params.query)
  if (params.status) q.set('status', params.status)
  if (params.verified !== undefined) q.set('verified', params.verified)
  if (params.page) q.set('page', params.page)
  if (params.limit) q.set('limit', params.limit)
  return request(`/admin/employers?${q}`)
}

// ─── Project Moderation ───────────────────────────────

export async function listAllProjects(params = {}) {
  const q = new URLSearchParams()
  if (params.query) q.set('query', params.query)
  if (params.status) q.set('status', params.status)
  if (params.visibility) q.set('visibility', params.visibility)
  if (params.page) q.set('page', params.page)
  if (params.limit) q.set('limit', params.limit)
  return request(`/admin/projects?${q}`)
}

export async function moderateProject(projectId, action) {
  return request(`/admin/projects/${projectId}/moderate`, {
    method: 'PUT',
    body: JSON.stringify({ action }),
  })
}

// ─── Verification Management ──────────────────────────

export async function getPendingVerifications(page = 1, limit = 20) {
  return request(`/admin/verifications?page=${page}&limit=${limit}`)
}

export async function approveVerification(orgId) {
  return request(`/admin/verifications/${orgId}/approve`, { method: 'POST' })
}

export async function rejectVerification(orgId, reason = 'Admin rejected') {
  return request(`/admin/verifications/${orgId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

// ─── Content Moderation ───────────────────────────────

export async function moderateContent(entityType, entityId, action) {
  return request(`/admin/moderate/${entityType}/${entityId}`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  })
}

export async function listFlaggedContent(params = {}) {
  const q = new URLSearchParams()
  if (params.entityType) q.set('entityType', params.entityType)
  if (params.page) q.set('page', params.page)
  if (params.limit) q.set('limit', params.limit)
  return request(`/admin/flagged-content?${q}`)
}

// ─── Reports & Analytics ──────────────────────────────

export async function getReports(from, to) {
  const q = new URLSearchParams()
  if (from) q.set('from', from)
  if (to) q.set('to', to)
  return request(`/admin/reports?${q}`)
}

export async function getAnalytics(params = {}) {
  const q = new URLSearchParams()
  if (params.period) q.set('period', params.period)
  if (params.from) q.set('from', params.from)
  if (params.to) q.set('to', params.to)
  return request(`/admin/analytics?${q}`)
}

// ─── Analytics ────────────────────────────────────────

export async function getPlatformAnalytics(params = {}) {
  const q = new URLSearchParams()
  if (params.period) q.set('period', params.period)
  return request(`/admin/analytics/kpi?${q}`)
}

export async function getUserGrowthAnalytics(params = {}) {
  const q = new URLSearchParams()
  if (params.period) q.set('period', params.period)
  return request(`/admin/analytics/users/growth?${q}`)
}

export async function getJobAnalytics(params = {}) {
  const q = new URLSearchParams()
  if (params.period) q.set('period', params.period)
  return request(`/admin/analytics/jobs?${q}`)
}

export async function getProjectAnalytics(params = {}) {
  const q = new URLSearchParams()
  if (params.period) q.set('period', params.period)
  return request(`/admin/analytics/projects?${q}`)
}

export async function getEmployerAnalytics(params = {}) {
  const q = new URLSearchParams()
  if (params.period) q.set('period', params.period)
  return request(`/admin/analytics/employers?${q}`)
}

export async function getApplicationAnalytics(params = {}) {
  const q = new URLSearchParams()
  if (params.period) q.set('period', params.period)
  return request(`/admin/analytics/applications?${q}`)
}

export async function getReviewAnalytics(params = {}) {
  const q = new URLSearchParams()
  if (params.period) q.set('period', params.period)
  return request(`/admin/analytics/reviews?${q}`)
}

export async function getAnalyticsDashboard() {
  return request('/admin/analytics/dashboard')
}

export async function getTimeSeriesTrends(params = {}) {
  const q = new URLSearchParams()
  if (params.period) q.set('period', params.period)
  if (params.interval) q.set('interval', params.interval)
  return request(`/admin/analytics/trends?${q}`)
}

// ─── Activity Log ─────────────────────────────────────

export async function getActivityLogs(params = {}) {
  const q = new URLSearchParams()
  if (params.page) q.set('page', params.page)
  if (params.limit) q.set('limit', params.limit)
  if (params.action) q.set('action', params.action)
  if (params.entityType) q.set('entityType', params.entityType)
  if (params.userId) q.set('userId', params.userId)
  return request(`/admin/activity?${q}`)
}

// ─── Audit Logging ────────────────────────────────────

export async function queryAuditLogs(params = {}) {
  const q = new URLSearchParams()
  if (params.page) q.set('page', params.page)
  if (params.limit) q.set('limit', params.limit)
  if (params.userId) q.set('userId', params.userId)
  if (params.action) q.set('action', params.action)
  if (params.entityType) q.set('entityType', params.entityType)
  if (params.entityId) q.set('entityId', params.entityId)
  if (params.severity) q.set('severity', params.severity)
  if (params.userRole) q.set('userRole', params.userRole)
  if (params.search) q.set('search', params.search)
  if (params.from) q.set('from', params.from)
  if (params.to) q.set('to', params.to)
  if (params.sortBy) q.set('sortBy', params.sortBy)
  if (params.sortOrder) q.set('sortOrder', params.sortOrder)
  if (params.isSensitive !== undefined) q.set('isSensitive', String(params.isSensitive))
  return request(`/admin/audit-logs?${q}`)
}

export async function getAuditLogById(logId) {
  return request(`/admin/audit-logs/${logId}`)
}

export async function getAuditStats(params = {}) {
  const q = new URLSearchParams()
  if (params.from) q.set('from', params.from)
  if (params.to) q.set('to', params.to)
  return request(`/admin/audit-logs/stats?${q}`)
}

export async function getUserActivityHistory(userId, params = {}) {
  const q = new URLSearchParams()
  if (params.page) q.set('page', params.page)
  if (params.limit) q.set('limit', params.limit)
  return request(`/admin/audit-logs/user/${userId}?${q}`)
}

export async function getEntityAuditHistory(entityType, entityId, params = {}) {
  const q = new URLSearchParams()
  if (params.page) q.set('page', params.page)
  if (params.limit) q.set('limit', params.limit)
  return request(`/admin/audit-logs/entity/${entityType}/${entityId}?${q}`)
}

export async function getAdminAuditLogs(params = {}) {
  const q = new URLSearchParams()
  if (params.page) q.set('page', params.page)
  if (params.limit) q.set('limit', params.limit)
  return request(`/admin/audit-logs/admin/logs?${q}`)
}

export async function cleanupAuditLogs(retentionDays = 90) {
  return request('/admin/audit-logs/cleanup', {
    method: 'POST',
    body: JSON.stringify({ retentionDays }),
  })
}

// ─── Settings ─────────────────────────────────────────

export async function getSystemSettings() {
  return request('/admin/settings')
}

export async function updateSystemSettings(settings) {
  return request('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  })
}

export async function getAdminLogs() {
  return request('/admin/logs')
}
