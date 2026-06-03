import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createUserPublic } from '@/__tests__/fixtures/profile.fixture'
import { createApiSuccess } from '@/__tests__/helpers/api-response.fixture'
import type { LoginData } from '@/interfaces/auth.interface'
import { onSessionRefreshed, refreshAccessToken } from '@/utils/refresh-session.util'
import { setTokens } from '@/utils/storage.util'

const loginData: LoginData = {
  token: 'new-access',
  refreshToken: 'new-refresh',
  user: createUserPublic(),
}

describe('refresh-session.util', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('devuelve null si no hay refresh token', async () => {
    await expect(refreshAccessToken()).resolves.toBeNull()
  })

  it('renueva tokens y notifica al listener', async () => {
    setTokens('old-access', 'old-refresh')
    const listener = vi.fn()
    onSessionRefreshed(listener)

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => createApiSuccess(loginData),
      }),
    )

    const result = await refreshAccessToken()

    expect(result).toEqual(loginData)
    expect(listener).toHaveBeenCalledWith(loginData)
  })

  it('devuelve null cuando la API responde con error', async () => {
    setTokens('old-access', 'old-refresh')

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ status: 'error', error: 'INVALID_REFRESH_TOKEN' }),
      }),
    )

    await expect(refreshAccessToken()).resolves.toBeNull()
  })

  it('reutiliza la misma promesa mientras el refresh está en curso', async () => {
    setTokens('old-access', 'old-refresh')

    let resolveFetch!: (value: unknown) => void
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve
          }),
      ),
    )

    const first = refreshAccessToken()
    const second = refreshAccessToken()

    resolveFetch({
      ok: true,
      json: async () => createApiSuccess(loginData),
    })

    const [resultA, resultB] = await Promise.all([first, second])

    expect(resultA).toEqual(loginData)
    expect(resultB).toEqual(loginData)
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
