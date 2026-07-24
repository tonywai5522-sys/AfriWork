import { appConfig } from '../config/appConfig.js'

function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')
}

function isStrongPassword(password) {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  )
}

function isMinLength(value, min) {
  return typeof value === 'string' && value.trim().length >= min
}

function isValidName(name) {
  return isNonEmpty(name) && name.trim().length >= 2 && name.trim().length <= 150
}

function isValidUsername(username) {
  return (
    isNonEmpty(username) &&
    /^[a-zA-Z0-9_]{3,80}$/.test(username)
  )
}

function isValidRole(role) {
  return appConfig.roles.all.includes(role)
}

function buildValidationResult(errors) {
  return {
    isValid: errors.length === 0,
    errors,
    message: errors.length > 0 ? errors[0] : null,
  }
}

export function validateRegisterPayload(payload = {}) {
  const errors = []

  if (!payload.fullName || !isValidName(payload.fullName)) {
    errors.push('Full name is required and must be between 2 and 150 characters')
  }

  if (!payload.email || !isValidEmail(payload.email)) {
    errors.push('A valid email address is required')
  }

  if (!payload.password || !isStrongPassword(payload.password)) {
    errors.push(
      'Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character'
    )
  }

  if (payload.password !== payload.confirmPassword) {
    errors.push('Password and confirm password must match')
  }

  if (payload.username && !isValidUsername(payload.username)) {
    errors.push('Username must be 3-80 characters and can only contain letters, numbers, and underscores')
  }

  if (payload.role && !isValidRole(payload.role)) {
    errors.push(`Role must be one of: ${appConfig.roles.all.join(', ')}`)
  }

  if (!payload.agreeToTerms) {
    errors.push('You must agree to the terms and conditions')
  }

  return buildValidationResult(errors)
}

export function validateLoginPayload(payload = {}) {
  const errors = []

  if (!payload.email || !isValidEmail(payload.email)) {
    errors.push('A valid email address is required')
  }

  if (!isNonEmpty(payload.password)) {
    errors.push('Password is required')
  }

  return buildValidationResult(errors)
}

export function validateForgotPasswordPayload(payload = {}) {
  const errors = []

  if (!payload.email || !isValidEmail(payload.email)) {
    errors.push('A valid email address is required')
  }

  return buildValidationResult(errors)
}

export function validatePasswordResetPayload(payload = {}) {
  const errors = []

  if (!isNonEmpty(payload.userId)) {
    errors.push('User ID is required')
  }

  if (!isNonEmpty(payload.secret)) {
    errors.push('Reset secret is required (check your email for the reset link)')
  }

  if (!payload.password || !isStrongPassword(payload.password)) {
    errors.push(
      'Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character'
    )
  }

  if (payload.password !== payload.confirmPassword) {
    errors.push('Password and confirm password must match')
  }

  return buildValidationResult(errors)
}

export function validateEmailVerificationPayload(payload = {}) {
  const errors = []

  if (!payload.userId) {
    errors.push('User ID is required')
  }

  if (!payload.secret) {
    errors.push('Verification secret is required')
  }

  return buildValidationResult(errors)
}

export function validateProfileUpdatePayload(payload = {}) {
  const errors = []

  if (payload.fullName && !isValidName(payload.fullName)) {
    errors.push('Full name must be between 2 and 150 characters')
  }

  if (payload.username && !isValidUsername(payload.username)) {
    errors.push('Username must be 3-80 characters and can only contain letters, numbers, and underscores')
  }

  if (payload.phone && !/^\+?[\d\s\-()]{7,20}$/.test(payload.phone)) {
    errors.push('Please provide a valid phone number')
  }

  return buildValidationResult(errors)
}

export function validateChangePasswordPayload(payload = {}) {
  const errors = []

  if (!isNonEmpty(payload.currentPassword)) {
    errors.push('Current password is required')
  }

  if (!payload.newPassword || !isStrongPassword(payload.newPassword)) {
    errors.push(
      'New password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character'
    )
  }

  if (payload.newPassword !== payload.confirmNewPassword) {
    errors.push('New password and confirm password must match')
  }

  if (payload.currentPassword === payload.newPassword) {
    errors.push('New password must be different from current password')
  }

  return buildValidationResult(errors)
}
