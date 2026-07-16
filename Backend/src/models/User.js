export class User {
  constructor({ id, email, role = 'talent' }) {
    this.id = id
    this.email = email
    this.role = role
  }
}
