import { beforeEach, describe, expect, it } from 'vitest'

import { AUTH_REFRESH_TOKEN_KEY, AUTH_TOKEN_KEY } from '@/constants/auth.constants'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '@/utils/storage.util'

describe('storage.util', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('guarda y lee tokens de acceso y refresh', () => {
    setTokens('access-123', 'refresh-456')

    expect(getAccessToken()).toBe('access-123')
    expect(getRefreshToken()).toBe('refresh-456')
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe('access-123')
    expect(localStorage.getItem(AUTH_REFRESH_TOKEN_KEY)).toBe('refresh-456')
  })

  it('devuelve null cuando no hay tokens', () => {
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('elimina ambos tokens al cerrar sesión', () => {
    setTokens('access-123', 'refresh-456')

    clearTokens()

    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })
})
