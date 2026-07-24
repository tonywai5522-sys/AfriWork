export class PortfolioProject {
  constructor(data = {}) {
    this.id = data.id || data.$id || ''
    this.userId = data.userId || ''
    this.title = data.title || ''
    this.slug = data.slug || ''
    this.description = data.description || ''
    this.category = data.category || 'web_app'
    this.tags = data.tags || []
    this.technologies = data.technologies || []
    this.liveUrl = data.liveUrl || ''
    this.githubUrl = data.githubUrl || ''
    this.demoUrl = data.demoUrl || ''
    this.thumbnailUrl = data.thumbnailUrl || ''
    this.thumbnailId = data.thumbnailId || ''
    this.media = data.media || []
    this.featuredImage = data.featuredImage || ''
    this.startDate = data.startDate || ''
    this.endDate = data.endDate || ''
    this.isOngoing = data.isOngoing || false
    this.highlights = data.highlights || []
    this.role = data.role || ''
    this.teamSize = data.teamSize || 1
    this.outcome = data.outcome || ''
    this.visibility = data.visibility || 'public'
    this.status = data.status || 'published'
    this.viewCount = data.viewCount || 0
    this.featured = data.featured || false
    this.createdAt = data.$createdAt || data.createdAt || ''
    this.updatedAt = data.$updatedAt || data.updatedAt || ''
  }

  isPublished() { return this.status === 'published' }
  isDraft() { return this.status === 'draft' }
  isArchived() { return this.status === 'archived' }
  isPublic() { return this.visibility === 'public' }

  getCategoryLabel() {
    const labels = {
      web_app: 'Web Application',
      mobile_app: 'Mobile App',
      api: 'API / Backend',
      design: 'UI/UX Design',
      data: 'Data / Analytics',
      ai: 'AI / Machine Learning',
      blockchain: 'Blockchain',
      devops: 'DevOps / Infrastructure',
      open_source: 'Open Source',
      freelance: 'Freelance Project',
      other: 'Other',
    }
    return labels[this.category] || this.category
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      title: this.title,
      slug: this.slug,
      description: this.description,
      category: this.category,
      categoryLabel: this.getCategoryLabel(),
      tags: this.tags,
      technologies: this.technologies,
      liveUrl: this.liveUrl,
      githubUrl: this.githubUrl,
      demoUrl: this.demoUrl,
      thumbnailUrl: this.thumbnailUrl,
      thumbnailId: this.thumbnailId,
      media: this.media,
      featuredImage: this.featuredImage,
      startDate: this.startDate,
      endDate: this.endDate,
      isOngoing: this.isOngoing,
      highlights: this.highlights,
      role: this.role,
      teamSize: this.teamSize,
      outcome: this.outcome,
      visibility: this.visibility,
      status: this.status,
      viewCount: this.viewCount,
      featured: this.featured,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
