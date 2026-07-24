import { Router } from 'express'
import { authenticate } from '../middleware/authMiddleware.js'
import * as courseController from '../controllers/courseController.js'

const router = Router()

router.use(authenticate)

// Categories
router.get('/categories', courseController.getCategories)
router.post('/categories', courseController.createCategory)
router.delete('/categories/:id', courseController.deleteCategory)

// Courses
router.get('/featured', courseController.getFeaturedCourses)
router.get('/', courseController.listCourses)
router.post('/', courseController.createCourse)
router.get('/:id', courseController.getCourse)
router.put('/:id', courseController.updateCourse)
router.delete('/:id', courseController.deleteCourse)

// Lessons
router.get('/:courseId/lessons', courseController.getCourseLessons)
router.post('/lessons', courseController.createLesson)
router.get('/lessons/:id', courseController.getLesson)
router.put('/lessons/:id', courseController.updateLesson)
router.delete('/lessons/:id', courseController.deleteLesson)

// Enrollments
router.post('/:courseId/enroll', courseController.enrollCourse)
router.get('/:courseId/enrollment', courseController.getEnrollment)
router.post('/:courseId/progress', courseController.updateProgress)
router.post('/:courseId/star', courseController.toggleStar)
router.post('/:courseId/certificate', courseController.generateCertificate)

// My learning
router.get('/my/enrollments', courseController.getUserEnrollments)

// Bookmarks
router.get('/bookmarks', courseController.getUserBookmarks)
router.post('/bookmarks', courseController.addBookmark)
router.delete('/bookmarks/:id', courseController.removeBookmark)

export default router
