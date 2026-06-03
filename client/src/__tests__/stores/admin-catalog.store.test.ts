import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as adminApi from '@/api/admin.api'
import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import type { AdminExerciseCatalogEntry } from '@/interfaces/admin-exercise-catalog.interface'
import { useAdminCatalogStore } from '@/stores/admin-catalog.store'

vi.mock('@/api/admin.api', () => ({
  getExerciseCatalog: vi.fn(),
  createExerciseCatalogEntry: vi.fn(),
  updateExerciseCatalogEntry: vi.fn(),
  deleteExerciseCatalogEntry: vi.fn(),
}))

const mockEntry: AdminExerciseCatalogEntry = {
  id: 1,
  slug: 'bench-press',
  nameEs: 'Press de banca',
  nameEn: 'Bench press',
  descriptionEs: null,
  descriptionEn: null,
  muscleGroup: 'CHEST',
  mediaType: 'GIF',
  mediaUrl: 'https://example.com/bench.gif',
  sortOrder: 0,
  active: true,
  importCount: 5,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('admin-catalog store', () => {
  beforeEach(() => {
    setupTestPinia()
    vi.mocked(adminApi.getExerciseCatalog).mockResolvedValue([mockEntry])
    vi.mocked(adminApi.createExerciseCatalogEntry).mockResolvedValue(mockEntry)
    vi.mocked(adminApi.updateExerciseCatalogEntry).mockResolvedValue(mockEntry)
    vi.mocked(adminApi.deleteExerciseCatalogEntry).mockResolvedValue({ deleted: true })
  })

  it('carga las entradas del catálogo de administración', async () => {
    const store = useAdminCatalogStore()

    const entries = await store.fetchAll()

    expect(entries).toEqual([mockEntry])
    expect(store.entries).toEqual([mockEntry])
    expect(store.loading).toBe(false)
  })

  it('crea una entrada y refresca el catálogo', async () => {
    const store = useAdminCatalogStore()
    const body = { slug: 'bench-press', nameEs: 'Press de banca', nameEn: 'Bench press' }

    const created = await store.create(body)

    expect(adminApi.createExerciseCatalogEntry).toHaveBeenCalledWith(body)
    expect(created).toEqual(mockEntry)
    expect(store.saving).toBe(false)
  })

  it('actualiza una entrada y refresca el catálogo', async () => {
    const store = useAdminCatalogStore()
    const body = { nameEs: 'Press inclinado' }

    const updated = await store.update(1, body)

    expect(adminApi.updateExerciseCatalogEntry).toHaveBeenCalledWith(1, body)
    expect(updated).toEqual(mockEntry)
    expect(store.saving).toBe(false)
  })

  it('elimina una entrada y refresca el catálogo', async () => {
    const store = useAdminCatalogStore()

    const result = await store.remove(1)

    expect(adminApi.deleteExerciseCatalogEntry).toHaveBeenCalledWith(1)
    expect(result).toEqual({ deleted: true })
    expect(store.deletingId).toBeNull()
  })
})
