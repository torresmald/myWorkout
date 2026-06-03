import { beforeEach, describe, expect, it, vi } from 'vitest'

import { stubFetchSuccess, stubFetchWithResponses } from '@/__tests__/helpers/mock-fetch'
import { createApiError } from '@/__tests__/helpers/api-response.fixture'
import { createUserPublic } from '@/__tests__/fixtures/profile.fixture'
import { api } from '@/api/client'
import { ApiError } from '@/utils/api-error.util'
import * as refreshSession from '@/utils/refresh-session.util'
import * as sentryConfig from '@/config/sentry'
import * as storageUtil from '@/utils/storage.util'

vi.mock('@sentry/vue', () => ({
  captureException: vi.fn(),
}))

vi.mock('@/utils/refresh-session.util', () => ({
  refreshAccessToken: vi.fn(),
}))

vi.mock('@/config/sentry', () => ({
  isSentryEnabled: vi.fn(),
}))

import { captureException } from '@sentry/vue'

describe('api client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.mocked(sentryConfig.isSentryEnabled).mockReturnValue(false)
    vi.mocked(refreshSession.refreshAccessToken).mockResolvedValue(null)
  })

  it('realiza petición GET y devuelve data', async () => {
    stubFetchSuccess({ id: 1 })

    const result = await api<{ id: number }>('/workouts')

    expect(result).toEqual({ id: 1 })
    expect(fetch).toHaveBeenCalledWith(
      '/api/workouts',
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    )
  })

  it('añade Authorization cuando hay token', async () => {
    vi.spyOn(storageUtil, 'getAccessToken').mockReturnValue('access-token')
    const fetchMock = stubFetchSuccess([])

    await api('/workouts')

    const [, init] = fetchMock.mock.calls[0]!
    const headers = init?.headers as Headers

    expect(headers.get('Authorization')).toBe('Bearer access-token')
  })

  it('añade Content-Type application/json cuando hay body', async () => {
    stubFetchSuccess(null)

    await api('/workouts', {
      method: 'POST',
      body: JSON.stringify({ name: 'Leg day' }),
    })

    const [, init] = vi.mocked(fetch).mock.calls[0]!
    const headers = init?.headers as Headers

    expect(headers.get('Content-Type')).toBe('application/json')
  })

  it('no sobrescribe Authorization ni Content-Type existentes', async () => {
    vi.spyOn(storageUtil, 'getAccessToken').mockReturnValue('access-token')
    stubFetchSuccess(null)

    await api('/workouts', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer custom',
        'Content-Type': 'text/plain',
      },
      body: 'raw',
    })

    const [, init] = vi.mocked(fetch).mock.calls[0]!
    const headers = init?.headers as Headers

    expect(headers.get('Authorization')).toBe('Bearer custom')
    expect(headers.get('Content-Type')).toBe('text/plain')
  })

  it('reintenta tras refrescar token en respuesta 401', async () => {
    vi.mocked(refreshSession.refreshAccessToken).mockResolvedValue({
      token: 'new-access',
      refreshToken: 'new-refresh',
      user: createUserPublic(),
    })

    stubFetchWithResponses(
      { status: 401, body: createApiError('UNAUTHORIZED') },
      { status: 200, body: { status: 'success', data: { ok: true }, error: null } },
    )

    const result = await api<{ ok: boolean }>('/workouts')

    expect(refreshSession.refreshAccessToken).toHaveBeenCalled()
    expect(result).toEqual({ ok: true })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('no reintenta si el refresh falla', async () => {
    stubFetchWithResponses({
      status: 401,
      body: createApiError('UNAUTHORIZED'),
    })

    await expect(api('/workouts')).rejects.toBeInstanceOf(ApiError)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('no intenta refresh en rutas de autenticación', async () => {
    stubFetchWithResponses({
      status: 401,
      body: createApiError('INVALID_CREDENTIALS'),
    })

    await expect(api('/auth/login', { method: 'POST', body: '{}' })).rejects.toBeInstanceOf(ApiError)

    expect(refreshSession.refreshAccessToken).not.toHaveBeenCalled()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('lanza ApiError en respuestas de error', async () => {
    stubFetchWithResponses({
      status: 400,
      body: createApiError('VALIDATION_ERROR'),
    })

    await expect(api('/workouts')).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
  })

  it('reporta errores 5xx a Sentry cuando está habilitado', async () => {
    vi.mocked(sentryConfig.isSentryEnabled).mockReturnValue(true)

    stubFetchWithResponses({
      status: 500,
      body: createApiError('INTERNAL_ERROR'),
    })

    await expect(api('/workouts')).rejects.toBeInstanceOf(ApiError)
    expect(captureException).toHaveBeenCalled()
  })

  it('no reporta errores 4xx a Sentry', async () => {
    vi.mocked(sentryConfig.isSentryEnabled).mockReturnValue(true)

    stubFetchWithResponses({
      status: 404,
      body: createApiError('NOT_FOUND'),
    })

    await expect(api('/workouts')).rejects.toBeInstanceOf(ApiError)
    expect(captureException).not.toHaveBeenCalled()
  })
})
