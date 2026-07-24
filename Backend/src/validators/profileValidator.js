import { appConfig } from '../config/appConfig.js'

function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isValidUrl(url) {
  if (!url) return true
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function buildValidationResult(errors) {
  return {
    isValid: errors.length === 0,
    errors,
    message: errors.length > 0 ? errors[0] : null,
  }
}

export function validateProfileCreatePayload(payload = {}) {
  const errors = []

  if (!payload.headline || !isNonEmpty(payload.headline)) {
    errors.push('Headline is required')
  } else if (payload.headline.length > 160) {
    errors.push('Headline must be 160 characters or less')
  }

  if (payload.bio && payload.bio.length > 4000) {
    errors.push('Bio must be 4000 characters or less')
  }

  if (payload.location && payload.location.length > 160) {
    errors.push('Location must be 160 characters or less')
  }

  if (payload.website && !isValidUrl(payload.website)) {
    errors.push('Website must be a valid URL')
  }

  if (payload.linkedinUrl && !isValidUrl(payload.linkedinUrl)) {
    errors.push('LinkedIn URL must be a valid URL')
  }

  if (payload.githubUrl && !isValidUrl(payload.githubUrl)) {
    errors.push('GitHub URL must be a valid URL')
  }

  if (payload.portfolioUrl && !isValidUrl(payload.portfolioUrl)) {
    errors.push('Portfolio URL must be a valid URL')
  }

  if (payload.experienceLevel && !['entry', 'junior', 'mid', 'senior', 'expert'].includes(payload.experienceLevel)) {
    errors.push('Experience level must be one of: entry, junior, mid, senior, expert')
  }

  if (payload.availability && !['available', 'busy', 'unavailable'].includes(payload.availability)) {
    errors.push('Availability must be one of: available, busy, unavailable')
  }

  if (payload.preferredWorkType && !['full_time', 'part_time', 'contract', 'remote', 'hybrid'].includes(payload.preferredWorkType)) {
    errors.push('Work type must be one of: full_time, part_time, contract, remote, hybrid')
  }

  if (payload.hourlyRate !== undefined && (typeof payload.hourlyRate !== 'number' || payload.hourlyRate < 0)) {
    errors.push('Hourly rate must be a positive number')
  }

  return buildValidationResult(errors)
}

export function validateExperiencePayload(payload = {}) {
  const errors = []

  if (!payload.company || !isNonEmpty(payload.company)) {
    errors.push('Company name is required')
  }

  if (!payload.title || !isNonEmpty(payload.title)) {
    errors.push('Job title is required')
  }

  if (!payload.startDate) {
    errors.push('Start date is required')
  }

  if (!payload.current && payload.endDate && new Date(payload.endDate) < new Date(payload.startDate)) {
    errors.push('End date cannot be before start date')
  }

  return buildValidationResult(errors)
}

export function validateEducationPayload(payload = {}) {
  const errors = []

  if (!payload.institution || !isNonEmpty(payload.institution)) {
    errors.push('Institution name is required')
  }

  if (!payload.degree || !isNonEmpty(payload.degree)) {
    errors.push('Degree is required')
  }

  if (!payload.field || !isNonEmpty(payload.field)) {
    errors.push('Field of study is required')
  }

  return buildValidationResult(errors)
}

export function validateSkillPayload(payload = {}) {
  const errors = []

  if (!payload.name || !isNonEmpty(payload.name)) {
    errors.push('Skill name is required')
  }

  if (payload.name && payload.name.length > 120) {
    errors.push('Skill name must be 120 characters or less')
  }

  return buildValidationResult(errors)
}
