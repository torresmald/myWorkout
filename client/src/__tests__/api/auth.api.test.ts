import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/api/client'
import * as authApi from '@/api/auth.api'

vi.mock('@/api/client', () => ({
  api: vi.fn(),
}))

describe('auth.api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('login envía credenciales', async () => {
    const body = { email: 'user@example.com', password: 'secret' }
    vi.mocked(api).mockResolvedValue({ token: 't', refreshToken: 'r', user: {} })

    await authApi.login(body)

    expect(api).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  })

  it('loginWithGoogle envía idToken y locale', async () => {
    vi.mocked(api).mockResolvedValue({})

    await authApi.loginWithGoogle('google-token', 'es')

    expect(api).toHaveBeenCalledWith('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken: 'google-token', locale: 'es' }),
    })
  })

  it('register envía datos de registro', async () => {
    const body = { email: 'new@example.com', password: 'secret', name: 'New' }
    vi.mocked(api).mockResolvedValue({})

    await authApi.register({ ...body, locale: 'es' })

    expect(api).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...body, locale: 'es' }),
    })
  })

  it('verifyEmail envía token', async () => {
    vi.mocked(api).mockResolvedValue({})

    await authApi.verifyEmail('verify-token')

    expect(api).toHaveBeenCalledWith('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token: 'verify-token' }),
    })
  })

  it('resendVerification envía email y locale', async () => {
    vi.mocked(api).mockResolvedValue({})

    await authApi.resendVerification('user@example.com', 'en')

    expect(api).toHaveBeenCalledWith('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com', locale: 'en' }),
    })
  })

  it('forgotPassword envía email y locale', async () => {
    vi.mocked(api).mockResolvedValue({})

    await authApi.forgotPassword('user@example.com', 'es')

    expect(api).toHaveBeenCalledWith('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com', locale: 'es' }),
    })
  })

  it('resetPassword envía token y password', async () => {
    vi.mocked(api).mockResolvedValue({})

    await authApi.resetPassword('reset-token', 'new-secret')

    expect(api).toHaveBeenCalledWith('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: 'reset-token', password: 'new-secret' }),
    })
  })

  it('getMe obtiene usuario actual', async () => {
    vi.mocked(api).mockResolvedValue({ id: 1 })

    await authApi.getMe()

    expect(api).toHaveBeenCalledWith('/auth/me')
  })

  it('logout envía refreshToken', async () => {
    vi.mocked(api).mockResolvedValue(null)

    await authApi.logout('refresh-token')

    expect(api).toHaveBeenCalledWith('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: 'refresh-token' }),
    })
  })
})
