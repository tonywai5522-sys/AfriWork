const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`
  const config = { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, credentials: 'include', ...options }
  const res = await fetch(url, config)
  const payload = await res.json()
  if (!res.ok) throw new Error(payload.message || 'Request failed')
  return payload
}

// Categories
export async function getCategories() { return request('/learning/categories') }
export async function createCategory(data) { return request('/learning/categories', { method: 'POST', body: JSON.stringify(data) }) }

// Courses
export async function listCourses(params = {}) {
  const q = new URLSearchParams()
  if (params.page) q.set('page', params.page)
  if (params.categoryId) q.set('categoryId', params.categoryId)
  if (params.level) q.set('level', params.level)
  if (params.search) q.set('search', params.search)
  if (params.sortBy) q.set('sortBy', params.sortBy)
  return request(`/learning?${q}`)
}
export async function getFeaturedCourses(limit = 6) { return request(`/learning/featured?limit=${limit}`) }
export async function getCourse(id) { return request(`/learning/${id}`) }
export async function createCourse(data) { return request('/learning', { method: 'POST', body: JSON.stringify(data) }) }
export async function updateCourse(id, data) { return request(`/learning/${id}`, { method: 'PUT', body: JSON.stringify(data) }) }
export async function deleteCourse(id) { return request(`/learning/${id}`, { method: 'DELETE' }) }

// Lessons
export async function getCourseLessons(courseId) { return request(`/learning/${courseId}/lessons`) }
export async function getLesson(id) { return request(`/learning/lessons/${id}`) }
export async function createLesson(data) { return request('/learning/lessons', { method: 'POST', body: JSON.stringify(data) }) }
export async function updateLesson(id, data) { return request(`/learning/lessons/${id}`, { method: 'PUT', body: JSON.stringify(data) }) }

// Enrollments
export async function enrollCourse(courseId) { return request(`/learning/${courseId}/enroll`, { method: 'POST' }) }
export async function getEnrollment(courseId) { return request(`/learning/${courseId}/enrollment`) }
export async function getUserEnrollments() { return request('/learning/my/enrollments') }
export async function updateProgress(courseId, lessonId) { return request(`/learning/${courseId}/progress`, { method: 'POST', body: JSON.stringify({ lessonId }) }) }
export async function toggleStar(courseId) { return request(`/learning/${courseId}/star`, { method: 'POST' }) }
export async function generateCertificate(courseId) { return request(`/learning/${courseId}/certificate`, { method: 'POST' }) }

// Bookmarks
export async function getBookmarks(courseId) { const q = courseId ? `?courseId=${courseId}` : ''; return request(`/learning/bookmarks${q}`) }
export async function addBookmark(data) { return request('/learning/bookmarks', { method: 'POST', body: JSON.stringify(data) }) }
export async function removeBookmark(id) { return request(`/learning/bookmarks/${id}`, { method: 'DELETE' }) }
