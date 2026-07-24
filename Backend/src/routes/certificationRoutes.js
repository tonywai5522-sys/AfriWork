import { Router } from 'express'
import {
  getCertifications,
  addCertification,
  updateCertification,
  deleteCertification,
  updateAllCertifications,
} from '../controllers/certificationController.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = Router()

// All certification routes require authentication
router.get('/', authenticate, getCertifications)
router.post('/', authenticate, addCertification)
router.put('/', authenticate, updateAllCertifications)
router.put('/:certId', authenticate, updateCertification)
router.delete('/:certId', authenticate, deleteCertification)

export default router
