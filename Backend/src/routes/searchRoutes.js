import { Router } from 'express'
import { authenticate } from '../middleware/authMiddleware.js'
import * as searchController from '../controllers/searchController.js'

const router = Router()

// Global search (authenticated)
router.post('/', authenticate, searchController.globalSearch)

// Recent searches
router.get('/recent', authenticate, searchController.getRecentSearches)
router.post('/recent', authenticate, searchController.saveRecentSearch)
router.delete('/recent', authenticate, searchController.clearRecentSearches)
router.delete('/recent/:searchId', authenticate, searchController.deleteRecentSearch)

export default router
