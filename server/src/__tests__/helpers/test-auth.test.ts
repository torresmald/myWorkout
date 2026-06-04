import { describe, expect, it } from 'vitest'

import { verifyAccessToken } from '../../utils/jwt.util.js'
import { authHeader, createTestAccessToken } from '../helpers/test-auth.js'

describe('test-auth helper', () => {
  it('genera un token Bearer válido para tests', () => {
    const token = createTestAccessToken({
      userId: 42,
      email: 'runner@example.com',
      role: 'ADMIN',
    })

    expect(token.split('.')).toHaveLength(3)
    expect(verifyAccessToken(token)).toMatchObject({
      userId: 42,
      email: 'runner@example.com',
      role: 'ADMIN',
    })
  })

  it('construye header Authorization', () => {
    expect(authHeader('abc123')).toEqual({ Authorization: 'Bearer abc123' })
  })
})
