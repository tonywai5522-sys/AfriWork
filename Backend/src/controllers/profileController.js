import { sendError, sendSuccess } from '../utils/responseFormatter.js'
import {
  validateProfileCreatePayload,
  validateExperiencePayload,
  validateEducationPayload,
  validateSkillPayload,
} from '../validators/profileValidator.js'
import * as profileService from '../services/profileService.js'

export async function getMyProfile(req, res) {
  try {
    const userId = req.user.id
    const profile = await profileService.getProfileByUserId(userId)

    if (!profile) {
      return sendSuccess(res, { profile: null }, 'No profile found. Create one to get started.')
    }

    return sendSuccess(res, { profile: profile.toJSON() }, 'Profile retrieved')
  } catch (error) {
    return sendError(res, 'Failed to retrieve profile', 400)
  }
}

export async function createProfile(req, res) {
  try {
    const validation = validateProfileCreatePayload(req.body)
    if (!validation.isValid) {
      return sendError(res, validation.errors, 400)
    }

    const userId = req.user.id
    const existing = await profileService.getProfileByUserId(userId)
    if (existing) {
      return sendError(res, 'Profile already exists. Use PUT to update.', 409)
    }

    const profile = await profileService.createProfile(userId, req.body)
    return sendSuccess(res, { profile: profile.toJSON() }, 'Profile created successfully')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to create profile', 400)
  }
}

export async function updateMyProfile(req, res) {
  try {
    const validation = validateProfileCreatePayload(req.body)
    if (!validation.isValid) {
      return sendError(res, validation.errors, 400)
    }

    const userId = req.user.id
    const profile = await profileService.updateProfile(userId, req.body)

    return sendSuccess(res, { profile: profile.toJSON() }, 'Profile updated successfully')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to update profile', 400)
  }
}

export async function updateSkills(req, res) {
  try {
    const { skills } = req.body
    if (!Array.isArray(skills)) {
      return sendError(res, 'Skills must be an array', 400)
    }

    for (const skill of skills) {
      const v = validateSkillPayload(skill)
      if (!v.isValid) return sendError(res, v.errors, 400)
    }

    const userId = req.user.id
    const profile = await profileService.updateProfileSkills(userId, skills)

    return sendSuccess(res, { profile: profile.toJSON() }, 'Skills updated')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to update skills', 400)
  }
}

export async function updateExperience(req, res) {
  try {
    const { experience } = req.body
    if (!Array.isArray(experience)) {
      return sendError(res, 'Experience must be an array', 400)
    }

    for (const exp of experience) {
      const v = validateExperiencePayload(exp)
      if (!v.isValid) return sendError(res, v.errors, 400)
    }

    const userId = req.user.id
    const profile = await profileService.updateProfileExperience(userId, experience)

    return sendSuccess(res, { profile: profile.toJSON() }, 'Experience updated')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to update experience', 400)
  }
}

export async function updateEducation(req, res) {
  try {
    const { education } = req.body
    if (!Array.isArray(education)) {
      return sendError(res, 'Education must be an array', 400)
    }

    for (const edu of education) {
      const v = validateEducationPayload(edu)
      if (!v.isValid) return sendError(res, v.errors, 400)
    }

    const userId = req.user.id
    const profile = await profileService.updateProfileEducation(userId, education)

    return sendSuccess(res, { profile: profile.toJSON() }, 'Education updated')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to update education', 400)
  }
}

export async function uploadProfileAvatar(req, res) {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded. Send a file with field name "avatar".', 400)
    }

    const userId = req.user.id
    const result = await profileService.uploadAvatar(userId, req.file)

    return sendSuccess(res, result, 'Avatar uploaded successfully')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to upload avatar', 400)
  }
}

export async function deleteProfileAvatar(req, res) {
  try {
    const userId = req.user.id
    await profileService.deleteAvatar(userId)

    return sendSuccess(res, null, 'Avatar removed')
  } catch (error) {
    return sendError(res, 'Failed to delete avatar', 400)
  }
}

export async function getPublicProfile(req, res) {
  try {
    const { userId } = req.params
    const profile = await profileService.getPublicProfile(userId)

    if (!profile) {
      return sendError(res, 'Profile not found', 404)
    }

    return sendSuccess(res, { profile }, 'Public profile retrieved')
  } catch (error) {
    return sendError(res, 'Failed to retrieve public profile', 400)
  }
}

export async function getProfileCompleteness(req, res) {
  try {
    const userId = req.user.id
    const profile = await profileService.getProfileByUserId(userId)

    if (!profile) {
      return sendSuccess(res, { completeness: 0, sections: [] }, 'No profile data yet')
    }

    const completeness = profile.getCompletionPercentage()

    const sections = [
      { name: 'headline', completed: !!profile.headline, weight: 15 },
      { name: 'bio', completed: !!profile.bio, weight: 15 },
      { name: 'avatar', completed: !!profile.avatarUrl, weight: 10 },
      { name: 'location', completed: !!profile.location, weight: 5 },
      { name: 'experienceLevel', completed: !!profile.experienceLevel, weight: 5 },
      { name: 'skills', completed: profile.skills.length > 0, weight: 20 },
      { name: 'experience', completed: profile.experience.length > 0, weight: 20 },
      { name: 'education', completed: profile.education.length > 0, weight: 10 },
      { name: 'certifications', completed: profile.certifications.length > 0, weight: 10 },
      { name: 'resume', completed: !!profile.resumeUrl, weight: 10 },
    ]

    return sendSuccess(res, { completeness, sections, profile: profile.toJSON() }, 'Profile completeness retrieved')
  } catch (error) {
    return sendError(res, 'Failed to get profile completeness', 400)
  }
}
