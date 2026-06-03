import { beforeEach, describe, expect, it, vi } from 'vitest'

import { stubFetchSuccess } from '@/__tests__/helpers/mock-fetch'
import { api } from '@/api/client'
import * as profileApi from '@/api/profile.api'
import { ApiError } from '@/utils/api-error.util'
import * as storageUtil from '@/utils/storage.util'

vi.mock('@/api/client', () => ({
  api: vi.fn(),
}))

describe('profile.api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getProfile obtiene el perfil', async () => {
    vi.mocked(api).mockResolvedValue({ id: 1 })

    await profileApi.getProfile()

    expect(api).toHaveBeenCalledWith('/profile')
  })

  it('updateProfile envía cambios parciales', async () => {
    const body = { name: 'Updated', locale: 'en' as const }
    vi.mocked(api).mockResolvedValue(body)

    await profileApi.updateProfile(body)

    expect(api).toHaveBeenCalledWith('/profile', {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  })

  it('addWeight registra un peso', async () => {
    vi.mocked(api).mockResolvedValue({})

    await profileApi.addWeight(75.5)

    expect(api).toHaveBeenCalledWith('/profile/weight', {
      method: 'POST',
      body: JSON.stringify({ weightKg: 75.5 }),
    })
  })

  it('updateWeight actualiza una entrada', async () => {
    const body = { weightKg: 76 }
    vi.mocked(api).mockResolvedValue({})

    await profileApi.updateWeight(3, body)

    expect(api).toHaveBeenCalledWith('/profile/weight/3', {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  })

  it('deleteWeight elimina una entrada', async () => {
    vi.mocked(api).mockResolvedValue({})

    await profileApi.deleteWeight(3)

    expect(api).toHaveBeenCalledWith('/profile/weight/3', {
      method: 'DELETE',
    })
  })

  it('uploadAvatar envía FormData con token', async () => {
    vi.spyOn(storageUtil, 'getAccessToken').mockReturnValue('access-token')
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    stubFetchSuccess({ id: 1, profileImageUrl: '/avatar.png' })

    const result = await profileApi.uploadAvatar(file)

    expect(result).toEqual({ id: 1, profileImageUrl: '/avatar.png' })
    expect(fetch).toHaveBeenCalledWith('/api/profile/avatar', {
      method: 'POST',
      headers: { Authorization: 'Bearer access-token' },
      body: expect.any(FormData),
    })
  })

  it('uploadAvatar funciona sin token', async () => {
    vi.spyOn(storageUtil, 'getAccessToken').mockReturnValue(null)
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    stubFetchSuccess({ id: 1 })

    await profileApi.uploadAvatar(file)

    expect(fetch).toHaveBeenCalledWith('/api/profile/avatar', {
      method: 'POST',
      headers: undefined,
      body: expect.any(FormData),
    })
  })

  it('uploadAvatar lanza ApiError en respuesta de error', async () => {
    vi.spyOn(storageUtil, 'getAccessToken').mockReturnValue('token')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 400,
        json: async () => ({ status: 'error', error: 'INVALID_FILE' }),
      }),
    )

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })

    await expect(profileApi.uploadAvatar(file)).rejects.toBeInstanceOf(ApiError)
  })

  it('deleteAvatar elimina el avatar', async () => {
    vi.mocked(api).mockResolvedValue({ id: 1 })

    await profileApi.deleteAvatar()

    expect(api).toHaveBeenCalledWith('/profile/avatar', {
      method: 'DELETE',
    })
  })
})
