export function validateAccountSettings(payload = {}) {
  const errors = []

  if (payload.fullName !== undefined) {
    if (typeof payload.fullName !== 'string' || payload.fullName.trim().length < 2 || payload.fullName.trim().length > 150) {
      errors.push('Full name must be between 2 and 150 characters')
    }
  }

  if (payload.phone !== undefined && payload.phone !== '') {
    if (!/^\+?[\d\s\-()]{7,20}$/.test(payload.phone)) {
      errors.push('Please provide a valid phone number')
    }
  }

  if (payload.username !== undefined) {
    if (typeof payload.username !== 'string' || !/^[a-zA-Z0-9_]{3,80}$/.test(payload.username)) {
      errors.push('Username must be 3-80 characters and can only contain letters, numbers, and underscores')
    }
  }

  if (payload.timezone !== undefined && payload.timezone !== '') {
    const validZones = [
      'UTC-12', 'UTC-11', 'UTC-10', 'UTC-9', 'UTC-8', 'UTC-7', 'UTC-6', 'UTC-5',
      'UTC-4', 'UTC-3', 'UTC-2', 'UTC-1', 'UTC+0', 'UTC+1', 'UTC+2', 'UTC+3',
      'UTC+4', 'UTC+5', 'UTC+6', 'UTC+7', 'UTC+8', 'UTC+9', 'UTC+10', 'UTC+11', 'UTC+12',
    ]
    if (!validZones.includes(payload.timezone)) {
      errors.push('Invalid timezone')
    }
  }

  if (payload.language !== undefined && payload.language !== '') {
    const validLanguages = ['en', 'fr', 'es', 'ar', 'pt', 'sw', 'ha', 'yo', 'ig', 'am']
    if (!validLanguages.includes(payload.language)) {
      errors.push('Invalid language selection')
    }
  }

  if (payload.locale !== undefined && payload.locale !== '') {
    const validLocales = ['en-US', 'en-GB', 'fr-FR', 'es-ES', 'ar-SA', 'pt-BR', 'sw-KE']
    if (!validLocales.includes(payload.locale)) {
      errors.push('Invalid locale selection')
    }
  }

  return { isValid: errors.length === 0, errors }
}

export function validateSecuritySettings(payload = {}) {
  const errors = []

  if (payload.currentPassword !== undefined) {
    if (typeof payload.currentPassword !== 'string' || payload.currentPassword.length === 0) {
      errors.push('Current password is required')
    }
  }

  if (payload.newPassword !== undefined) {
    if (typeof payload.newPassword !== 'string' || payload.newPassword.length < 8) {
      errors.push('New password must be at least 8 characters')
    } else {
      if (!/[A-Z]/.test(payload.newPassword)) errors.push('New password must include an uppercase letter')
      if (!/[a-z]/.test(payload.newPassword)) errors.push('New password must include a lowercase letter')
      if (!/[0-9]/.test(payload.newPassword)) errors.push('New password must include a number')
      if (!/[^A-Za-z0-9]/.test(payload.newPassword)) errors.push('New password must include a special character')
    }
  }

  if (payload.confirmNewPassword !== undefined && payload.newPassword !== payload.confirmNewPassword) {
    errors.push('New password and confirmation must match')
  }

  if (payload.sessionTimeout !== undefined) {
    const timeout = parseInt(payload.sessionTimeout)
    if (isNaN(timeout) || timeout < 5 || timeout > 1440) {
      errors.push('Session timeout must be between 5 and 1440 minutes')
    }
  }

  return { isValid: errors.length === 0, errors }
}

export function validatePrivacySettings(payload = {}) {
  const errors = []

  const validOptions = ['public', 'private', 'connections_only']
  if (payload.profileVisibility !== undefined && !validOptions.includes(payload.profileVisibility)) {
    errors.push('Profile visibility must be public, private, or connections_only')
  }

  if (payload.searchIndexing !== undefined && typeof payload.searchIndexing !== 'boolean') {
    errors.push('Search indexing must be a boolean')
  }

  if (payload.showEmail !== undefined && typeof payload.showEmail !== 'boolean') {
    errors.push('Show email must be a boolean')
  }

  if (payload.showPhone !== undefined && typeof payload.showPhone !== 'boolean') {
    errors.push('Show phone must be a boolean')
  }

  if (payload.showLocation !== undefined && typeof payload.showLocation !== 'boolean') {
    errors.push('Show location must be a boolean')
  }

  if (payload.showRate !== undefined && typeof payload.showRate !== 'boolean') {
    errors.push('Show rate must be a boolean')
  }

  if (payload.dataForPersonalization !== undefined && typeof payload.dataForPersonalization !== 'boolean') {
    errors.push('Data for personalization must be a boolean')
  }

  return { isValid: errors.length === 0, errors }
}

export function validateNotificationSettings(payload = {}) {
  const errors = []

  const validKeys = [
    'email_notifications', 'push_notifications', 'in_app_notifications',
    'application_updates', 'message_alerts', 'project_updates',
    'team_invites', 'marketing_emails', 'job_alerts', 'milestone_updates',
    'payment_alerts', 'review_reminders',
  ]

  for (const [key, value] of Object.entries(payload)) {
    if (validKeys.includes(key) && typeof value !== 'boolean') {
      errors.push(`${key} must be a boolean`)
    }
  }

  if (payload.digest_frequency !== undefined) {
    const validFrequencies = ['instant', 'daily', 'weekly']
    if (!validFrequencies.includes(payload.digest_frequency)) {
      errors.push('Digest frequency must be instant, daily, or weekly')
    }
  }

  if (payload.quiet_hours_start !== undefined && payload.quiet_hours_start !== '') {
    if (!/^\d{2}:\d{2}$/.test(payload.quiet_hours_start)) {
      errors.push('Quiet hours start must be in HH:MM format')
    }
  }

  if (payload.quiet_hours_end !== undefined && payload.quiet_hours_end !== '') {
    if (!/^\d{2}:\d{2}$/.test(payload.quiet_hours_end)) {
      errors.push('Quiet hours end must be in HH:MM format')
    }
  }

  return { isValid: errors.length === 0, errors }
}

export function validateConnectedAccount(payload = {}) {
  const errors = []

  if (payload.provider !== undefined) {
    const validProviders = ['google', 'github', 'linkedin', 'microsoft', 'apple', 'twitter']
    if (!validProviders.includes(payload.provider)) {
      errors.push('Provider must be one of: google, github, linkedin, microsoft, apple, twitter')
    }
  }

  if (payload.providerAccountId !== undefined && typeof payload.providerAccountId !== 'string') {
    errors.push('Provider account ID must be a string')
  }

  if (payload.accessToken !== undefined && typeof payload.accessToken !== 'string') {
    errors.push('Access token must be a string')
  }

  return { isValid: errors.length === 0, errors }
}
