export class Organization {
  constructor(data = {}) {
    this.id = data.id || data.$id || ''
    this.name = data.name || ''
    this.slug = data.slug || ''
    this.description = data.description || ''
    this.website = data.website || ''
    this.logoUrl = data.logoUrl || ''
    this.logoId = data.logoId || ''
    this.industry = data.industry || ''
    this.location = data.location || ''
    this.companySize = data.companySize || ''
    this.foundedYear = data.foundedYear || ''
    this.ownerId = data.ownerId || ''
    this.isActive = data.isActive !== false
    this.verificationStatus = data.verificationStatus || 'unverified'
    this.verifiedAt = data.verifiedAt || ''
    this.socialLinks = data.socialLinks || {}
    this.recruiters = data.recruiters || []
    this.branding = data.branding || {
      primaryColor: '#0f172a',
      logoUrl: '',
      coverUrl: '',
    }
    this.metadata = data.metadata || {}
    this.status = data.status || 'active'
    this.createdAt = data.$createdAt || data.createdAt || ''
    this.updatedAt = data.$updatedAt || data.updatedAt || ''
  }

  isVerified() {
    return this.verificationStatus === 'verified'
  }

  isPending() {
    return this.verificationStatus === 'pending'
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      website: this.website,
      logoUrl: this.logoUrl,
      logoId: this.logoId,
      industry: this.industry,
      location: this.location,
      companySize: this.companySize,
      foundedYear: this.foundedYear,
      ownerId: this.ownerId,
      isActive: this.isActive,
      verificationStatus: this.verificationStatus,
      verifiedAt: this.verifiedAt,
      socialLinks: this.socialLinks,
      recruiters: this.recruiters,
      branding: this.branding,
      metadata: this.metadata,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}

export class Recruiter {
  constructor(data = {}) {
    this.id = data.id || data.$id || ''
    this.userId = data.userId || ''
    this.organizationId = data.organizationId || ''
    this.role = data.role || 'recruiter'
    this.permissions = data.permissions || ['view_applications', 'post_jobs', 'message_talent']
    this.invitedBy = data.invitedBy || ''
    this.invitedAt = data.invitedAt || ''
    this.joinedAt = data.joinedAt || ''
    this.status = data.status || 'pending'
    this.name = data.name || ''
    this.email = data.email || ''
  }

  get roleLabel() {
    return this.role.charAt(0).toUpperCase() + this.role.slice(1)
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      organizationId: this.organizationId,
      role: this.role,
      permissions: this.permissions,
      invitedBy: this.invitedBy,
      invitedAt: this.invitedAt,
      joinedAt: this.joinedAt,
      status: this.status,
      name: this.name,
      email: this.email,
    }
  }
}
