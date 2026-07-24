import test from 'node:test'
import assert from 'node:assert/strict'
import { validateRegisterPayload, validateLoginPayload, validatePasswordResetPayload } from '../validators/authValidator.js'
import { requireRole } from '../middleware/authMiddleware.js'

test('validateRegisterPayload rejects weak passwords', () => {
  const result = validateRegisterPayload({
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'short',
    confirmPassword: 'short',
  })

  assert.equal(result.isValid, false)
  assert.match(result.errors.join(' '), /password/i)
})

test('validateLoginPayload accepts valid credentials', () => {
  const result = validateLoginPayload({
    email: 'ada@example.com',
    password: 'StrongPassword123!',
  })

  assert.equal(result.isValid, true)
  assert.deepEqual(result.errors, [])
})

test('validatePasswordResetPayload requires matching passwords', () => {
  const result = validatePasswordResetPayload({
    userId: '123',
    secret: 'abc',
    password: 'NewPassword123!',
    confirmPassword: 'WrongPassword123!',
  })

  assert.equal(result.isValid, false)
  assert.match(result.errors.join(' '), /match/i)
})

test('requireRole blocks users without the required role', () => {
  const req = { user: { role: 'talent' } }
  const res = {
    statusCode: 200,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.payload = payload
      return this
    },
  }

  let nextCalled = false
  requireRole('admin')(req, res, () => {
    nextCalled = true
  })

  assert.equal(res.statusCode, 403)
  assert.equal(nextCalled, false)
})
