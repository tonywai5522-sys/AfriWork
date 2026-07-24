export class Job {
  constructor(data = {}) {
    this.id = data.id || data.$id || ''
    this.title = data.title || ''
    this.description = data.description || ''
    this.responsibilities = data.responsibilities || ''
    this.requirements = data.requirements || ''
    this.employerId = data.employerId || ''
    this.companyId = data.companyId || ''
    this.companyName = data.companyName || ''
    this.companyLogo = data.companyLogo || ''
    this.location = data.location || ''
    this.remote = data.remote || false
    this.jobType = data.jobType || 'full_time'
    this.category = data.category || ''
    this.experienceLevel = data.experienceLevel || 'mid'
    this.skills = data.skills || []
    this.salaryMin = data.salaryMin || 0
    this.salaryMax = data.salaryMax || 0
    this.currency = data.currency || 'USD'
    this.applicationUrl = data.applicationUrl || ''
    this.applicationEmail = data.applicationEmail || ''
    this.deadline = data.deadline || ''
    this.status = data.status || 'draft'
    this.isFeatured = data.isFeatured || false
    this.viewCount = data.viewCount || 0
    this.applicationCount = data.applicationCount || 0
    this.createdAt = data.$createdAt || data.createdAt || ''
    this.updatedAt = data.$updatedAt || data.updatedAt || ''
  }

  isActive() { return this.status === 'active' }
  isDraft() { return this.status === 'draft' }
  isFeatured() { return this.isFeatured }

  getSalaryRange() {
    if (!this.salaryMin && !this.salaryMax) return ''
    const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(n)
    if (this.salaryMin && this.salaryMax) return `${fmt(this.salaryMin)} - ${fmt(this.salaryMax)} ${this.currency}`
    if (this.salaryMin) return `From ${fmt(this.salaryMin)} ${this.currency}`
    return `Up to ${fmt(this.salaryMax)} ${this.currency}`
  }

  toJSON() {
    return {
      id: this.id, title: this.title, description: this.description,
      responsibilities: this.responsibilities, requirements: this.requirements,
      employerId: this.employerId, companyId: this.companyId,
      companyName: this.companyName, companyLogo: this.companyLogo,
      location: this.location, remote: this.remote, jobType: this.jobType,
      category: this.category, experienceLevel: this.experienceLevel,
      skills: this.skills, salaryMin: this.salaryMin, salaryMax: this.salaryMax,
      currency: this.currency, applicationUrl: this.applicationUrl,
      applicationEmail: this.applicationEmail, deadline: this.deadline,
      status: this.status, isFeatured: this.isFeatured,
      viewCount: this.viewCount, applicationCount: this.applicationCount,
      createdAt: this.createdAt, updatedAt: this.updatedAt,
      salaryRange: this.getSalaryRange(),
    }
  }
}
