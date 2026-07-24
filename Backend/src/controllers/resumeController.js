import { sendError, sendSuccess } from '../utils/responseFormatter.js'
import * as resumeService from '../services/resumeService.js'

export async function uploadResume(req, res) {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded. Send a file with field name "resume".', 400)
    }

    const userId = req.user.id
    const result = await resumeService.uploadResume(userId, req.file)
    return sendSuccess(res, result, 'Resume uploaded successfully')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to upload resume', 400)
  }
}

export async function downloadResume(req, res) {
  try {
    const userId = req.params.userId || req.user.id
    const result = await resumeService.downloadResume(userId)

    res.setHeader('Content-Type', result.mimeType)
    res.setHeader('Content-Disposition', `attachment; filename="${result.name}"`)
    res.send(result.buffer)
  } catch (error) {
    return sendError(res, error?.message || 'Failed to download resume', 404)
  }
}

export async function getResumeInfo(req, res) {
  try {
    const userId = req.user.id
    const info = await resumeService.getResumeInfo(userId)
    if (!info) {
      return sendSuccess(res, { resume: null }, 'No resume uploaded')
    }
    return sendSuccess(res, { resume: info }, 'Resume info retrieved')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to get resume info', 400)
  }
}

export async function deleteResume(req, res) {
  try {
    const userId = req.user.id
    await resumeService.deleteResume(userId)
    return sendSuccess(res, null, 'Resume deleted')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to delete resume', 400)
  }
}

export async function getPublicResumeUrl(req, res) {
  try {
    const { userId } = req.params
    const result = await resumeService.getPublicResumeUrl(userId)
    if (!result) {
      return sendError(res, 'No resume found for this user', 404)
    }
    return sendSuccess(res, result, 'Resume URL retrieved')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to get resume URL', 400)
  }
}
