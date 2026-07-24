export class Profile {
  constructor(data = {}) {
    this.userId = data.userId || ''
    this.headline = data.headline || ''
    this.bio = data.bio || ''
    this.location = data.location || ''
    this.timezone = data.timezone || ''
    this.experienceLevel = data.experienceLevel || 'mid'
    this.availability = data.availability || 'available'
    this.website = data.website || ''
    this.linkedinUrl = data.linkedinUrl || ''
    this.githubUrl = data.githubUrl || ''
    this.portfolioUrl = data.portfolioUrl || ''
    this.resumeUrl = data.resumeUrl || ''
    this.avatarUrl = data.avatarUrl || ''
    this.avatarId = data.avatarId || ''
    this.preferredWorkType = data.preferredWorkType || 'remote'
    this.hourlyRate = data.hourlyRate || 0
    this.currency = data.currency || 'USD'
    this.isVerified = data.isVerified || false
    this.verificationStatus = data.verificationStatus || 'unverified'
    this.profileCompleteness = data.profileCompleteness || 0
    this.skills = data.skills || []
    this.experience = data.experience || []
    this.education = data.education || []
    this.socialLinks = data.socialLinks || {}
    this.languages = data.languages || []
    this.certifications = data.certifications || []
    this.metadata = data.metadata || {}
    this.id = data.id || data.$id || ''
    this.createdAt = data.$createdAt || data.createdAt || ''
    this.updatedAt = data.$updatedAt || data.updatedAt || ''
  }

  getCompletionPercentage() {
    const fields = [
      { key: 'headline', weight: 15 },
      { key: 'bio', weight: 15 },
      { key: 'avatarUrl', weight: 10 },
      { key: 'location', weight: 5 },
      { key: 'experienceLevel', weight: 5 },
    ]

    let score = 0
    for (const field of fields) {
      if (this[field.key]) score += field.weight
    }

    if (this.skills.length > 0) score += Math.min(this.skills.length * 5, 20)
    if (this.experience.length > 0) score += Math.min(this.experience.length * 7, 20)
    if (this.education.length > 0) score += Math.min(this.education.length * 5, 10)
    if (this.certifications.length > 0) score += Math.min(this.certifications.length * 5, 10)

    return Math.min(score, 100)
  }

  isComplete() {
    return this.getCompletionPercentage() >= 60
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      headline: this.headline,
      bio: this.bio,
      location: this.location,
      timezone: this.timezone,
      experienceLevel: this.experienceLevel,
      availability: this.availability,
      website: this.website,
      linkedinUrl: this.linkedinUrl,
      githubUrl: this.githubUrl,
      portfolioUrl: this.portfolioUrl,
      resumeUrl: this.resumeUrl,
      avatarUrl: this.avatarUrl,
      avatarId: this.avatarId,
      preferredWorkType: this.preferredWorkType,
      hourlyRate: this.hourlyRate,
      currency: this.currency,
      isVerified: this.isVerified,
      verificationStatus: this.verificationStatus,
      profileCompleteness: this.getCompletionPercentage(),
      skills: this.skills,
      experience: this.experience,
      education: this.education,
      socialLinks: this.socialLinks,
      languages: this.languages,
      certifications: this.certifications,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}

export class Experience {
  constructor(data = {}) {
    this.id = data.id || data.$id || `exp_${Date.now()}`
    this.company = data.company || ''
    this.title = data.title || ''
    this.location = data.location || ''
    this.startDate = data.startDate || ''
    this.endDate = data.endDate || ''
    this.current = data.current || false
    this.description = data.description || ''
    this.technologies = data.technologies || []
  }
}

export class Education {
  constructor(data = {}) {
    this.id = data.id || data.$id || `edu_${Date.now()}`
    this.institution = data.institution || ''
    this.degree = data.degree || ''
    this.field = data.field || ''
    this.startDate = data.startDate || ''
    this.endDate = data.endDate || ''
    this.gpa = data.gpa || ''
    this.description = data.description || ''
  }
}
