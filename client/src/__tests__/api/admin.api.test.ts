import { beforeEach, describe, expect, it, vi } from 'vitest'

import { stubFetchSuccess } from '@/__tests__/helpers/mock-fetch'
import { api } from '@/api/client'
import * as adminApi from '@/api/admin.api'
import { ApiError } from '@/utils/api-error.util'
import * as storageUtil from '@/utils/storage.util'

vi.mock('@/api/client', () => ({
  api: vi.fn(),
}))

describe('admin.api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getMetrics obtiene métricas de admin', async () => {
    vi.mocked(api).mockResolvedValue({ users: 10 })

    await adminApi.getMetrics()

    expect(api).toHaveBeenCalledWith('/admin/metrics')
  })

  it('getUsers obtiene usuarios paginados con valores por defecto', async () => {
    vi.mocked(api).mockResolvedValue({ items: [] })

    await adminApi.getUsers()

    expect(api).toHaveBeenCalledWith('/admin/users?page=1&pageSize=20')
  })

  it('getUsers acepta página y tamaño personalizados', async () => {
    vi.mocked(api).mockResolvedValue({ items: [] })

    await adminApi.getUsers(2, 50)

    expect(api).toHaveBeenCalledWith('/admin/users?page=2&pageSize=50')
  })

  it('updateUserRole actualiza el rol de un usuario', async () => {
    const body = { role: 'ADMIN' as const }
    vi.mocked(api).mockResolvedValue({})

    await adminApi.updateUserRole(5, body)

    expect(api).toHaveBeenCalledWith('/admin/users/5/role', {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  })

  it('getExerciseCatalog obtiene catálogo de admin', async () => {
    vi.mocked(api).mockResolvedValue([])

    await adminApi.getExerciseCatalog()

    expect(api).toHaveBeenCalledWith('/admin/exercise-catalog')
  })

  it('createExerciseCatalogEntry crea entrada de catálogo', async () => {
    const body = { slug: 'bench-press', muscleGroup: 'CHEST' as const }
    vi.mocked(api).mockResolvedValue({})

    await adminApi.createExerciseCatalogEntry(body)

    expect(api).toHaveBeenCalledWith('/admin/exercise-catalog', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  })

  it('updateExerciseCatalogEntry actualiza entrada de catálogo', async () => {
    const body = { slug: 'incline-bench' }
    vi.mocked(api).mockResolvedValue({})

    await adminApi.updateExerciseCatalogEntry(9, body)

    expect(api).toHaveBeenCalledWith('/admin/exercise-catalog/9', {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  })

  it('deleteExerciseCatalogEntry elimina entrada de catálogo', async () => {
    vi.mocked(api).mockResolvedValue({})

    await adminApi.deleteExerciseCatalogEntry(9)

    expect(api).toHaveBeenCalledWith('/admin/exercise-catalog/9', {
      method: 'DELETE',
    })
  })

  it('uploadCatalogMedia envía archivo con token y slug', async () => {
    vi.spyOn(storageUtil, 'getAccessToken').mockReturnValue('admin-token')
    const file = new File(['media'], 'video.mp4', { type: 'video/mp4' })
    stubFetchSuccess({ url: '/media/video.mp4' })

    const result = await adminApi.uploadCatalogMedia(file, ' bench-press ')

    expect(result).toEqual({ url: '/media/video.mp4' })
    expect(fetch).toHaveBeenCalledWith('/api/admin/exercise-catalog/media/upload', {
      method: 'POST',
      headers: { Authorization: 'Bearer admin-token' },
      body: expect.any(FormData),
    })
  })

  it('uploadCatalogMedia omite slug vacío', async () => {
    vi.spyOn(storageUtil, 'getAccessToken').mockReturnValue(null)
    const file = new File(['media'], 'video.mp4', { type: 'video/mp4' })
    stubFetchSuccess({ url: '/media/video.mp4' })

    await adminApi.uploadCatalogMedia(file, '   ')

    expect(fetch).toHaveBeenCalledWith('/api/admin/exercise-catalog/media/upload', {
      method: 'POST',
      headers: undefined,
      body: expect.any(FormData),
    })
  })

  it('uploadCatalogMedia lanza ApiError en respuesta de error', async () => {
    vi.spyOn(storageUtil, 'getAccessToken').mockReturnValue('token')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 500,
        json: async () => ({ status: 'error', error: 'UPLOAD_FAILED' }),
      }),
    )

    const file = new File(['media'], 'video.mp4', { type: 'video/mp4' })

    await expect(adminApi.uploadCatalogMedia(file)).rejects.toBeInstanceOf(ApiError)
  })
})
