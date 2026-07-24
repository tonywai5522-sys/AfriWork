export class RecentSearch {
  constructor(doc = {}) {
    this.id = doc.$id || doc.id || ''
    this.userId = doc.userId || ''
    this.query = doc.query || ''
    this.type = doc.type || 'all'
    this.results = doc.results || 0
    this.createdAt = doc.createdAt || new Date().toISOString()
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      query: this.query,
      type: this.type,
      results: this.results,
      createdAt: this.createdAt,
    }
  }
}
