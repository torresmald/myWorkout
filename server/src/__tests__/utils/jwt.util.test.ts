import { describe, expect, it } from 'vitest'

import { signAccessToken, verifyAccessToken } from '../../utils/jwt.util.js'

describe('jwt.util', () => {
  it('firma y verifica access tokens', () => {
    const payload = {
      userId: 12,
      email: 'user@example.com',
      role: 'USER' as const,
    }

    const token = signAccessToken(payload)

    expect(verifyAccessToken(token)).toMatchObject(payload)
  })

  it('rechaza tokens inválidos', () => {
    expect(() => verifyAccessToken('token.invalido')).toThrow()
  })
})
