import { describe, expect, it } from 'vitest'

import { normalizeEmail } from '../../utils/auth.util.js'

describe('auth.util', () => {
  it('normaliza emails', () => {
    expect(normalizeEmail('  User@Example.COM ')).toBe('user@example.com')
  })
})
