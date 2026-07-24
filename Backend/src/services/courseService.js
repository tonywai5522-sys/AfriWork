import { ID, Query } from 'node-appwrite'
import { getDatabases } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { Course, Lesson, CourseCategory, Enrollment, Bookmark } from '../models/Course.js'
import { logger } from '../utils/logger.js'

const DB_ID = appConfig.appwrite.databaseId
const COURSES_COLL = process.env.APPWRITE_COURSES_COLLECTION_ID || 'courses'
const LESSONS_COLL = process.env.APPWRITE_LESSONS_COLLECTION_ID || 'lessons'
const CATEGORIES_COLL = process.env.APPWRITE_COURSE_CATEGORIES_COLLECTION_ID || 'course_categories'
const ENROLLMENTS_COLL = process.env.APPWRITE_ENROLLMENTS_COLLECTION_ID || 'enrollments'
const BOOKMARKS_COLL = process.env.APPWRITE_BOOKMARKS_COLLECTION_ID || 'bookmarks'

// ─── Categories ────────────────────────────────────────
export async function getCategories() {
  const dbs = getDatabases()
  try {
    const docs = await dbs.listDocuments(DB_ID, CATEGORIES_COLL, [Query.orderAsc('order'), Query.limit(50)])
    return docs.documents.map(d => new CourseCategory(d))
  } catch { return [] }
}

export async function createCategory(data) {
  const dbs = getDatabases()
  const doc = await dbs.createDocument(DB_ID, CATEGORIES_COLL, ID.unique(), data)
  return new CourseCategory(doc)
}

export async function deleteCategory(id) {
  const dbs = getDatabases()
  await dbs.deleteDocument(DB_ID, CATEGORIES_COLL, id)
  return { deleted: true }
}

// ─── Courses ────────────────────────────────────────────
export async function createCourse(data) {
  const dbs = getDatabases()
  const doc = await dbs.createDocument(DB_ID, COURSES_COLL, ID.unique(), data)
  logger.info(`Course created`, { courseId: doc.$id, title: data.title })
  return new Course(doc)
}

export async function getCourseById(id) {
  const dbs = getDatabases()
  try { const doc = await dbs.getDocument(DB_ID, COURSES_COLL, id); return new Course(doc) } catch { return null }
}

export async function updateCourse(id, data) {
  const dbs = getDatabases()
  const doc = await dbs.updateDocument(DB_ID, COURSES_COLL, id, data)
  return new Course(doc)
}

export async function deleteCourse(id) {
  const dbs = getDatabases()
  await dbs.deleteDocument(DB_ID, COURSES_COLL, id)
  return { deleted: true }
}

export async function listCourses({ page = 1, limit = 12, categoryId, level, search, sortBy = 'date', instructorId, publishedOnly = true } = {}) {
  const dbs = getDatabases()
  const queries = [Query.limit(limit), Query.offset((page - 1) * limit)]
  if (publishedOnly) queries.push(Query.equal('isPublished', [true]))
  if (categoryId) queries.push(Query.equal('categoryId', [categoryId]))
  if (level) queries.push(Query.equal('level', [level]))
  if (instructorId) queries.push(Query.equal('instructorId', [instructorId]))
  if (search) queries.push(Query.search('title', search))
  if (sortBy === 'popular') queries.push(Query.orderDesc('enrollmentCount'))
  else if (sortBy === 'rating') queries.push(Query.orderDesc('rating'))
  else queries.push(Query.orderDesc('$createdAt'))

  try {
    const docs = await dbs.listDocuments(DB_ID, COURSES_COLL, queries)
    return { courses: docs.documents.map(d => new Course(d)), total: docs.total, page, limit, hasMore: docs.total > page * limit }
  } catch { return { courses: [], total: 0, page, limit, hasMore: false } }
}

export async function getFeaturedCourses(limit = 6) {
  const dbs = getDatabases()
  try {
    const docs = await dbs.listDocuments(DB_ID, COURSES_COLL, [
      Query.equal('isFeatured', [true]),
      Query.equal('isPublished', [true]),
      Query.orderDesc('enrollmentCount'),
      Query.limit(limit),
    ])
    return docs.documents.map(d => new Course(d))
  } catch { return [] }
}

// ─── Lessons ────────────────────────────────────────────
export async function createLesson(data) {
  const dbs = getDatabases()
  const doc = await dbs.createDocument(DB_ID, LESSONS_COLL, ID.unique(), data)
  return new Lesson(doc)
}

export async function getLessonById(id) {
  const dbs = getDatabases()
  try { const doc = await dbs.getDocument(DB_ID, LESSONS_COLL, id); return new Lesson(doc) } catch { return null }
}

export async function updateLesson(id, data) {
  const dbs = getDatabases()
  const doc = await dbs.updateDocument(DB_ID, LESSONS_COLL, id, data)
  return new Lesson(doc)
}

export async function deleteLesson(id) {
  const dbs = getDatabases()
  await dbs.deleteDocument(DB_ID, LESSONS_COLL, id)
  return { deleted: true }
}

export async function getCourseLessons(courseId) {
  const dbs = getDatabases()
  try {
    const docs = await dbs.listDocuments(DB_ID, LESSONS_COLL, [
      Query.equal('courseId', [courseId]),
      Query.equal('isPublished', [true]),
      Query.orderAsc('order'),
      Query.limit(200),
    ])
    return docs.documents.map(d => new Lesson(d))
  } catch { return [] }
}

// ─── Enrollments ────────────────────────────────────────
export async function enrollUser(userId, courseId) {
  const dbs = getDatabases()
  const existing = await dbs.listDocuments(DB_ID, ENROLLMENTS_COLL, [
    Query.equal('userId', [userId]),
    Query.equal('courseId', [courseId]),
    Query.limit(1),
  ])
  if (existing.documents.length > 0) return new Enrollment(existing.documents[0])

  const now = new Date().toISOString()
  const doc = await dbs.createDocument(DB_ID, ENROLLMENTS_COLL, ID.unique(), {
    userId, courseId, progress: 0, completedLessons: [], currentLessonId: '',
    startedAt: now, completedAt: '', isCompleted: false, lastAccessedAt: now,
    isStarred: false, rating: 0, certificateUrl: '',
  })
  // Increment enrollment count on course
  try {
    const course = await getCourseById(courseId)
    if (course) await updateCourse(courseId, { enrollmentCount: (course.enrollmentCount || 0) + 1 })
  } catch { /* */ }
  return new Enrollment(doc)
}

export async function getEnrollment(userId, courseId) {
  const dbs = getDatabases()
  try {
    const docs = await dbs.listDocuments(DB_ID, ENROLLMENTS_COLL, [
      Query.equal('userId', [userId]), Query.equal('courseId', [courseId]), Query.limit(1),
    ])
    return docs.documents.length > 0 ? new Enrollment(docs.documents[0]) : null
  } catch { return null }
}

export async function getUserEnrollments(userId) {
  const dbs = getDatabases()
  try {
    const docs = await dbs.listDocuments(DB_ID, ENROLLMENTS_COLL, [
      Query.equal('userId', [userId]), Query.orderDesc('lastAccessedAt'), Query.limit(50),
    ])
    return docs.documents.map(d => new Enrollment(d))
  } catch { return [] }
}

export async function updateLessonProgress(userId, courseId, lessonId) {
  const dbs = getDatabases()
  const enrollment = await getEnrollment(userId, courseId)
  if (!enrollment) return null

  const completed = enrollment.completedLessons || []
  if (!completed.includes(lessonId)) completed.push(lessonId)

  const lessons = await getCourseLessons(courseId)
  const progress = lessons.length > 0 ? Math.round((completed.length / lessons.length) * 100) : 0
  const isCompleted = progress >= 100
  const now = new Date().toISOString()

  const updates = {
    completedLessons: completed, currentLessonId: lessonId, progress,
    lastAccessedAt: now, isCompleted,
    completedAt: isCompleted && !enrollment.completedAt ? now : enrollment.completedAt,
  }

  await dbs.updateDocument(DB_ID, ENROLLMENTS_COLL, enrollment.id, updates)
  return { ...enrollment.toJSON(), ...updates }
}

export async function toggleStarCourse(userId, courseId) {
  const dbs = getDatabases()
  const enrollment = await getEnrollment(userId, courseId)
  if (!enrollment) return null
  await dbs.updateDocument(DB_ID, ENROLLMENTS_COLL, enrollment.id, { isStarred: !enrollment.isStarred })
  return { isStarred: !enrollment.isStarred }
}

// ─── Bookmarks ──────────────────────────────────────────
export async function addBookmark(userId, { lessonId, courseId, note = '', timestamp = 0 }) {
  const dbs = getDatabases()
  const doc = await dbs.createDocument(DB_ID, BOOKMARKS_COLL, ID.unique(), { userId, lessonId, courseId, note, timestamp })
  return new Bookmark(doc)
}

export async function removeBookmark(bookmarkId) {
  const dbs = getDatabases()
  await dbs.deleteDocument(DB_ID, BOOKMARKS_COLL, bookmarkId)
  return { removed: true }
}

export async function getUserBookmarks(userId) {
  const dbs = getDatabases()
  try {
    const docs = await dbs.listDocuments(DB_ID, BOOKMARKS_COLL, [
      Query.equal('userId', [userId]), Query.orderDesc('$createdAt'), Query.limit(50),
    ])
    return docs.documents.map(d => new Bookmark(d))
  } catch { return [] }
}

export async function getCourseBookmarks(userId, courseId) {
  const dbs = getDatabases()
  try {
    const docs = await dbs.listDocuments(DB_ID, BOOKMARKS_COLL, [
      Query.equal('userId', [userId]), Query.equal('courseId', [courseId]), Query.limit(50),
    ])
    return docs.documents.map(d => new Bookmark(d))
  } catch { return [] }
}

// ─── Certificate generation ────────────────────────────
export async function generateCertificateUrl(userId, courseId) {
  const dbs = getDatabases()
  const enrollment = await getEnrollment(userId, courseId)
  if (!enrollment || !enrollment.isCompleted) return null

  const url = `/api/v1/certificates/${userId}/${courseId}`
  await dbs.updateDocument(DB_ID, ENROLLMENTS_COLL, enrollment.id, { certificateUrl: url })
  return url
}
