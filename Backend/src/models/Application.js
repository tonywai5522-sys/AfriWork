export class Application {
  constructor(data = {}) {
    this.id = data.id || data.$id || ''
    this.jobId = data.jobId || ''
    this.jobTitle = data.jobTitle || ''
    this.applicantId = data.applicantId || ''
    this.applicantName = data.applicantName || ''
    this.applicantEmail = data.applicantEmail || ''
    this.applicantPhone = data.applicantPhone || ''
    this.coverLetter = data.coverLetter || ''
    this.resumeUrl = data.resumeUrl || ''
    this.resumeId = data.resumeId || ''
    this.portfolioUrl = data.portfolioUrl || ''
    this.proposedRate = data.proposedRate || 0
    this.currency = data.currency || 'USD'
    this.status = data.status || 'pending'
    this.reviewNotes = data.reviewNotes || ''
    this.reviewedBy = data.reviewedBy || ''
    this.reviewedAt = data.reviewedAt || ''
    this.employerId = data.employerId || ''
    this.createdAt = data.$createdAt || data.createdAt || ''
    this.updatedAt = data.$updatedAt || data.updatedAt || ''
  }

  isPending() { return this.status === 'pending' }
  isReviewed() { return this.status === 'reviewed' }
  isAccepted() { return this.status === 'accepted' }
  isRejected() { return this.status === 'rejected' }
  isWithdrawn() { return this.status === 'withdrawn' }

  toJSON() {
    return {
      id: this.id, jobId: this.jobId, jobTitle: this.jobTitle,
      applicantId: this.applicantId, applicantName: this.applicantName,
      applicantEmail: this.applicantEmail, applicantPhone: this.applicantPhone,
      coverLetter: this.coverLetter, resumeUrl: this.resumeUrl,
      resumeId: this.resumeId, portfolioUrl: this.portfolioUrl,
      proposedRate: this.proposedRate, currency: this.currency,
      status: this.status, reviewNotes: this.reviewNotes,
      reviewedBy: this.reviewedBy, reviewedAt: this.reviewedAt,
      employerId: this.employerId,
      createdAt: this.createdAt, updatedAt: this.updatedAt,
    }
  }
}
