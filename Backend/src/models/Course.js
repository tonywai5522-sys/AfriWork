export class Course {
  constructor(data = {}) {
    this.id = data.id || data.$id || ''
    this.title = data.title || ''
    this.slug = data.slug || ''
    this.description = data.description || ''
    this.shortDescription = data.shortDescription || ''
    this.categoryId = data.categoryId || ''
    this.categoryName = data.categoryName || ''
    this.instructorId = data.instructorId || ''
    this.instructorName = data.instructorName || ''
    this.instructorAvatar = data.instructorAvatar || ''
    this.thumbnailUrl = data.thumbnailUrl || ''
    this.level = data.level || 'beginner' // beginner, intermediate, advanced
    this.duration = data.duration || 0 // total minutes
    this.lessonCount = data.lessonCount || 0
    this.skills = data.skills || []
    this.prerequisites = data.prerequisites || ''
    this.whatYouLearn = data.whatYouLearn || []
    this.tags = data.tags || []
    this.price = data.price || 0
    this.currency = data.currency || 'USD'
    this.isFree = data.isFree !== false
    this.isPublished = data.isPublished || false
    this.isFeatured = data.isFeatured || false
    this.language = data.language || 'English'
    this.rating = data.rating || 0
    this.reviewCount = data.reviewCount || 0
    this.enrollmentCount = data.enrollmentCount || 0
    this.status = data.status || 'draft' // draft, published, archived
    this.metadata = data.metadata || {}
    this.createdAt = data.$createdAt || data.createdAt || ''
    this.updatedAt = data.$updatedAt || data.updatedAt || ''
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      slug: this.slug,
      description: this.description,
      shortDescription: this.shortDescription,
      categoryId: this.categoryId,
      categoryName: this.categoryName,
      instructorId: this.instructorId,
      instructorName: this.instructorName,
      instructorAvatar: this.instructorAvatar,
      thumbnailUrl: this.thumbnailUrl,
      level: this.level,
      duration: this.duration,
      lessonCount: this.lessonCount,
      skills: this.skills,
      prerequisites: this.prerequisites,
      whatYouLearn: this.whatYouLearn,
      tags: this.tags,
      price: this.price,
      currency: this.currency,
      isFree: this.isFree,
      isPublished: this.isPublished,
      isFeatured: this.isFeatured,
      language: this.language,
      rating: this.rating,
      reviewCount: this.reviewCount,
      enrollmentCount: this.enrollmentCount,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}

export class Lesson {
  constructor(data = {}) {
    this.id = data.id || data.$id || ''
    this.courseId = data.courseId || ''
    this.title = data.title || ''
    this.description = data.description || ''
    this.content = data.content || '' // rich text / markdown
    this.contentType = data.contentType || 'text' // text, video, quiz, coding, document
    this.videoUrl = data.videoUrl || ''
    this.videoDuration = data.videoDuration || 0
    this.resources = data.resources || []
    this.order = data.order || 0
    this.sectionTitle = data.sectionTitle || ''
    this.isFree = data.isFree || false
    this.isPublished = data.isPublished || false
    this.metadata = data.metadata || {}
    this.createdAt = data.$createdAt || data.createdAt || ''
    this.updatedAt = data.$updatedAt || data.updatedAt || ''
  }

  toJSON() {
    return {
      id: this.id,
      courseId: this.courseId,
      title: this.title,
      description: this.description,
      content: this.content,
      contentType: this.contentType,
      videoUrl: this.videoUrl,
      videoDuration: this.videoDuration,
      resources: this.resources,
      order: this.order,
      sectionTitle: this.sectionTitle,
      isFree: this.isFree,
      isPublished: this.isPublished,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}

export class CourseCategory {
  constructor(data = {}) {
    this.id = data.id || data.$id || ''
    this.name = data.name || ''
    this.slug = data.slug || ''
    this.description = data.description || ''
    this.icon = data.icon || ''
    this.color = data.color || ''
    this.order = data.order || 0
    this.courseCount = data.courseCount || 0
    this.createdAt = data.$createdAt || data.createdAt || ''
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      icon: this.icon,
      color: this.color,
      order: this.order,
      courseCount: this.courseCount,
      createdAt: this.createdAt,
    }
  }
}

export class Enrollment {
  constructor(data = {}) {
    this.id = data.id || data.$id || ''
    this.userId = data.userId || ''
    this.courseId = data.courseId || ''
    this.progress = data.progress || 0
    this.completedLessons = data.completedLessons || []
    this.currentLessonId = data.currentLessonId || ''
    this.startedAt = data.startedAt || ''
    this.completedAt = data.completedAt || ''
    this.isCompleted = data.isCompleted || false
    this.lastAccessedAt = data.lastAccessedAt || ''
    this.isStarred = data.isStarred || false
    this.rating = data.rating || 0
    this.certificateUrl = data.certificateUrl || ''
    this.createdAt = data.$createdAt || data.createdAt || ''
  }

  get progressPercent() {
    return Math.min(Math.round(this.progress), 100)
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      courseId: this.courseId,
      progress: this.progressPercent,
      completedLessons: this.completedLessons,
      currentLessonId: this.currentLessonId,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      isCompleted: this.isCompleted,
      lastAccessedAt: this.lastAccessedAt,
      isStarred: this.isStarred,
      rating: this.rating,
      certificateUrl: this.certificateUrl,
      createdAt: this.createdAt,
    }
  }
}

export class Bookmark {
  constructor(data = {}) {
    this.id = data.id || data.$id || ''
    this.userId = data.userId || ''
    this.courseId = data.courseId || ''
    this.lessonId = data.lessonId || ''
    this.note = data.note || ''
    this.timestamp = data.timestamp || 0
    this.createdAt = data.$createdAt || data.createdAt || ''
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      courseId: this.courseId,
      lessonId: this.lessonId,
      note: this.note,
      timestamp: this.timestamp,
      createdAt: this.createdAt,
    }
  }
}
