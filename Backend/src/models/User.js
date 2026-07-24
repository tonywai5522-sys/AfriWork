export class User {
  constructor({ id, email, name, role, emailVerified, phone, status, prefs } = {}) {
    this.id = id || ''
    this.email = email || ''
    this.name = name || ''
    this.role = role || 'talent'
    this.emailVerified = emailVerified || false
    this.phone = phone || ''
    this.status = status || 'active'
    this.prefs = prefs || {}
  }

  isAdmin() {
    return this.role === 'admin'
  }

  isEmployer() {
    return this.role === 'employer'
  }

  isModerator() {
    return this.role === 'moderator'
  }

  isTalent() {
    return this.role === 'talent'
  }

  isVerified() {
    return this.emailVerified
  }

  isActive() {
    return this.status === 'active'
  }

  hasRole(role) {
    return this.role === role
  }

  hasAnyRole(roles) {
    return roles.includes(this.role)
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      emailVerified: this.emailVerified,
      phone: this.phone,
      status: this.status,
    }
  }
}
