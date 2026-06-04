import { describe, expect, it } from 'vitest'

import {
  buildRefreshToken,
  generateRefreshToken,
  generateVerificationToken,
  hashToken,
  parseRefreshTokenUserId,
} from '../../utils/token.util.js'

describe('token.util', () => {
  it('hashea tokens de forma determinista', () => {
    expect(hashToken('abc')).toBe(hashToken('abc'))
    expect(hashToken('abc')).not.toBe(hashToken('xyz'))
  })

  it('genera tokens aleatorios con formato esperado', () => {
    expect(generateRefreshToken()).toHaveLength(80)
    expect(generateVerificationToken()).toHaveLength(64)
  })

  it('construye y parsea refresh tokens', () => {
    const refreshToken = buildRefreshToken(7)

    expect(refreshToken.startsWith('7.')).toBe(true)
    expect(parseRefreshTokenUserId(refreshToken)).toBe(7)
    expect(parseRefreshTokenUserId('invalid')).toBeNull()
    expect(parseRefreshTokenUserId('0.abc')).toBeNull()
    expect(parseRefreshTokenUserId('abc.def')).toBeNull()
  })
})
