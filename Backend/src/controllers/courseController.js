import * as courseService from '../services/courseService.js'
import { sendSuccess, sendError } from '../utils/responseFormatter.js'

// ─── Categories ────────────────────────────────────────
export async function getCategories(req, res) {
  try { const categories = await courseService.getCategories(); return sendSuccess(res, { categories }) }
  catch (e) { return sendError(res, e.message, 500) }
}
export async function createCategory(req, res) {
  try {
    if (!req.body.name) return sendError(res, 'Category name is required', 400)
    const cat = await courseService.createCategory(req.body)
    return sendSuccess(res, { category: cat.toJSON() }, 'Category created')
  } catch (e) { return sendError(res, e.message, 500) }
}
export async function deleteCategory(req, res) {
  try { await courseService.deleteCategory(req.params.id); return sendSuccess(res, null, 'Category deleted') }
  catch (e) { return sendError(res, e.message, 500) }
}

// ─── Courses ────────────────────────────────────────────
export async function createCourse(req, res) {
  try {
    if (!req.body.title) return sendError(res, 'Course title is required', 400)
    const course = await courseService.createCourse({ ...req.body, instructorId: req.user.id, instructorName: req.user.name })
    return sendSuccess(res, { course: course.toJSON() }, 'Course created')
  } catch (e) { return sendError(res, e.message, 500) }
}
export async function getCourse(req, res) {
  try {
    const course = await courseService.getCourseById(req.params.id)
    if (!course) return sendError(res, 'Course not found', 404)
    return sendSuccess(res, { course: course.toJSON() })
  } catch (e) { return sendError(res, e.message, 500) }
}
export async function updateCourse(req, res) {
  try {
    const course = await courseService.getCourseById(req.params.id)
    if (!course) return sendError(res, 'Course not found', 404)
    if (course.instructorId !== req.user.id && req.user.role !== 'admin') return sendError(res, 'Access denied', 403)
    const updated = await courseService.updateCourse(req.params.id, req.body)
    return sendSuccess(res, { course: updated.toJSON() }, 'Course updated')
  } catch (e) { return sendError(res, e.message, 500) }
}
export async function deleteCourse(req, res) {
  try {
    const course = await courseService.getCourseById(req.params.id)
    if (!course) return sendError(res, 'Course not found', 404)
    if (course.instructorId !== req.user.id && req.user.role !== 'admin') return sendError(res, 'Access denied', 403)
    await courseService.deleteCourse(req.params.id)
    return sendSuccess(res, null, 'Course deleted')
  } catch (e) { return sendError(res, e.message, 500) }
}
export async function listCourses(req, res) {
  try {
    const { page, limit, categoryId, level, search, sortBy, instructorId } = req.query
    const result = await courseService.listCourses({ page: parseInt(page) || 1, limit: parseInt(limit) || 12, categoryId, level, search, sortBy, instructorId })
    return sendSuccess(res, result)
  } catch (e) { return sendError(res, e.message, 500) }
}
export async function getFeaturedCourses(req, res) {
  try { const courses = await courseService.getFeaturedCourses(parseInt(req.query.limit) || 6); return sendSuccess(res, { courses }) }
  catch (e) { return sendError(res, e.message, 500) }
}

// ─── Lessons ────────────────────────────────────────────
export async function createLesson(req, res) {
  try {
    if (!req.body.title || !req.body.courseId) return sendError(res, 'Title and courseId required', 400)
    const lesson = await courseService.createLesson(req.body)
    return sendSuccess(res, { lesson: lesson.toJSON() }, 'Lesson created')
  } catch (e) { return sendError(res, e.message, 500) }
}
export async function getLesson(req, res) {
  try {
    const lesson = await courseService.getLessonById(req.params.id)
    if (!lesson) return sendError(res, 'Lesson not found', 404)
    return sendSuccess(res, { lesson: lesson.toJSON() })
  } catch (e) { return sendError(res, e.message, 500) }
}
export async function updateLesson(req, res) {
  try {
    const lesson = await courseService.updateLesson(req.params.id, req.body)
    return sendSuccess(res, { lesson: lesson.toJSON() }, 'Lesson updated')
  } catch (e) { return sendError(res, e.message, 500) }
}
export async function deleteLesson(req, res) {
  try { await courseService.deleteLesson(req.params.id); return sendSuccess(res, null, 'Lesson deleted') }
  catch (e) { return sendError(res, e.message, 500) }
}
export async function getCourseLessons(req, res) {
  try { const lessons = await courseService.getCourseLessons(req.params.courseId); return sendSuccess(res, { lessons }) }
  catch (e) { return sendError(res, e.message, 500) }
}

// ─── Enrollments ────────────────────────────────────────
export async function enrollCourse(req, res) {
  try {
    const enrollment = await courseService.enrollUser(req.user.id, req.params.courseId)
    return sendSuccess(res, { enrollment: enrollment.toJSON() }, 'Enrolled successfully')
  } catch (e) { return sendError(res, e.message, 500) }
}
export async function getEnrollment(req, res) {
  try {
    const enrollment = await courseService.getEnrollment(req.user.id, req.params.courseId)
    return sendSuccess(res, { enrollment: enrollment ? enrollment.toJSON() : null })
  } catch (e) { return sendError(res, e.message, 500) }
}
export async function getUserEnrollments(req, res) {
  try {
    const enrollments = await courseService.getUserEnrollments(req.user.id)
    return sendSuccess(res, { enrollments: enrollments.map(e => e.toJSON()) })
  } catch (e) { return sendError(res, e.message, 500) }
}
export async function updateProgress(req, res) {
  try {
    const { lessonId } = req.body
    if (!lessonId) return sendError(res, 'lessonId required', 400)
    const result = await courseService.updateLessonProgress(req.user.id, req.params.courseId, lessonId)
    return sendSuccess(res, { enrollment: result }, 'Progress updated')
  } catch (e) { return sendError(res, e.message, 500) }
}
export async function toggleStar(req, res) {
  try {
    const result = await courseService.toggleStarCourse(req.user.id, req.params.courseId)
    return sendSuccess(res, result, 'Star toggled')
  } catch (e) { return sendError(res, e.message, 500) }
}
export async function generateCertificate(req, res) {
  try {
    const url = await courseService.generateCertificateUrl(req.user.id, req.params.courseId)
    if (!url) return sendError(res, 'Complete the course to get a certificate', 400)
    return sendSuccess(res, { certificateUrl: url }, 'Certificate generated')
  } catch (e) { return sendError(res, e.message, 500) }
}

// ─── Bookmarks ──────────────────────────────────────────
export async function addBookmark(req, res) {
  try {
    const bookmark = await courseService.addBookmark(req.user.id, req.body)
    return sendSuccess(res, { bookmark: bookmark.toJSON() }, 'Bookmark added')
  } catch (e) { return sendError(res, e.message, 500) }
}
export async function removeBookmark(req, res) {
  try { await courseService.removeBookmark(req.params.id); return sendSuccess(res, null, 'Bookmark removed') }
  catch (e) { return sendError(res, e.message, 500) }
}
export async function getUserBookmarks(req, res) {
  try {
    const bookmarks = await courseService.getUserBookmarks(req.user.id)
    const courseId = req.query.courseId
    const items = courseId ? bookmarks.filter(b => b.courseId === courseId) : bookmarks
    return sendSuccess(res, { bookmarks: items.map(b => b.toJSON()) })
  } catch (e) { return sendError(res, e.message, 500) }
}
