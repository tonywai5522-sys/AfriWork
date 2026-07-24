export class Certification {
  constructor(data = {}) {
    this.id = data.id || data.$id || `cert_${Date.now()}`
    this.name = data.name || ''
    this.issuer = data.issuer || ''
    this.issueDate = data.issueDate || ''
    this.expiryDate = data.expiryDate || ''
    this.credentialUrl = data.credentialUrl || ''
    this.credentialId = data.credentialId || ''
    this.description = data.description || ''
    this.doesNotExpire = data.doesNotExpire || false
  }

  static create(data) {
    return new Certification(data)
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      issuer: this.issuer,
      issueDate: this.issueDate,
      expiryDate: this.expiryDate,
      credentialUrl: this.credentialUrl,
      credentialId: this.credentialId,
      description: this.description,
      doesNotExpire: this.doesNotExpire,
    }
  }
}

export function createEmptyCertification() {
  return new Certification({ id: `new_${Date.now()}` })
}
