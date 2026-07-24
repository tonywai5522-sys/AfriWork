import { sendError, sendSuccess } from '../utils/responseFormatter.js'
import { validateCertificationPayload } from '../validators/certificationValidator.js'
import * as certificationService from '../services/certificationService.js'

export async function getCertifications(req, res) {
  try {
    const userId = req.user.id
    const certifications = await certificationService.getCertifications(userId)
    return sendSuccess(res, { certifications }, 'Certifications retrieved')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to retrieve certifications', 400)
  }
}

export async function addCertification(req, res) {
  try {
    const validation = validateCertificationPayload(req.body)
    if (!validation.isValid) {
      return sendError(res, validation.errors, 400)
    }

    const userId = req.user.id
    const certification = await certificationService.addCertification(userId, req.body)
    return sendSuccess(res, { certification }, 'Certification added')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to add certification', 400)
  }
}

export async function updateCertification(req, res) {
  try {
    const { certId } = req.params
    if (!certId) {
      return sendError(res, 'Certification ID is required', 400)
    }

    const validation = validateCertificationPayload(req.body)
    if (!validation.isValid) {
      return sendError(res, validation.errors, 400)
    }

    const userId = req.user.id
    const certification = await certificationService.updateCertification(userId, certId, req.body)
    return sendSuccess(res, { certification }, 'Certification updated')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to update certification', 400)
  }
}

export async function deleteCertification(req, res) {
  try {
    const { certId } = req.params
    if (!certId) {
      return sendError(res, 'Certification ID is required', 400)
    }

    const userId = req.user.id
    await certificationService.deleteCertification(userId, certId)
    return sendSuccess(res, null, 'Certification deleted')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to delete certification', 400)
  }
}

export async function updateAllCertifications(req, res) {
  try {
    const { certifications } = req.body
    if (!Array.isArray(certifications)) {
      return sendError(res, 'Certifications must be an array', 400)
    }

    for (const cert of certifications) {
      const v = validateCertificationPayload(cert)
      if (!v.isValid) return sendError(res, v.errors, 400)
    }

    const userId = req.user.id
    const result = await certificationService.updateProfileCertifications(userId, certifications)
    return sendSuccess(res, { certifications: result }, 'Certifications updated')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to update certifications', 400)
  }
}
