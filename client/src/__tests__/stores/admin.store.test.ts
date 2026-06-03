import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as adminApi from '@/api/admin.api'
import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import type { AdminMetrics, AdminUserSummary } from '@/interfaces/admin.interface'
import { useAdminStore } from '@/stores/admin.store'

vi.mock('@/api/admin.api', () => ({
  getMetrics: vi.fn(),
  getUsers: vi.fn(),
  updateUserRole: vi.fn(),
}))

const mockMetrics: AdminMetrics = {
  totalUsers: 100,
  verifiedUsers: 80,
  adminUsers: 2,
  totalWorkouts: 500,
  totalExerciseTypes: 50,
  totalWeightEntries: 200,
  totalCatalogExercises: 120,
}

const mockUser: AdminUserSummary = {
  id: 1,
  email: 'user@example.com',
  name: 'Test User',
  role: 'USER',
  emailVerifiedAt: '2026-01-01T00:00:00.000Z',
  lastLoginAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  workoutCount: 10,
}

describe('admin store', () => {
  beforeEach(() => {
    setupTestPinia()
    vi.mocked(adminApi.getMetrics).mockResolvedValue(mockMetrics)
    vi.mocked(adminApi.getUsers).mockResolvedValue({
      users: [mockUser],
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 1,
    })
    vi.mocked(adminApi.updateUserRole).mockResolvedValue({ ...mockUser, role: 'ADMIN' })
  })

  it('carga las métricas de administración', async () => {
    const store = useAdminStore()

    await store.fetchMetrics()

    expect(store.metrics).toEqual(mockMetrics)
  })

  it('carga la página de usuarios', async () => {
    const store = useAdminStore()

    await store.fetchUsers(2)

    expect(adminApi.getUsers).toHaveBeenCalledWith(2)
    expect(store.users).toEqual([mockUser])
    expect(store.page).toBe(1)
    expect(store.totalPages).toBe(1)
    expect(store.total).toBe(1)
    expect(store.loading).toBe(false)
  })

  it('cambia el rol de un usuario y refresca métricas', async () => {
    const store = useAdminStore()
    store.users = [mockUser]

    const updated = await store.changeUserRole(1, 'ADMIN')

    expect(updated.role).toBe('ADMIN')
    expect(store.users[0]?.role).toBe('ADMIN')
    expect(adminApi.getMetrics).toHaveBeenCalled()
    expect(store.updatingUserId).toBeNull()
  })

  it('no modifica la lista si el usuario no existe al cambiar rol', async () => {
    const store = useAdminStore()
    store.users = [mockUser]

    await store.changeUserRole(99, 'ADMIN')

    expect(store.users[0]?.role).toBe('USER')
  })

  it('carga el dashboard con métricas y usuarios', async () => {
    const store = useAdminStore()

    await store.loadDashboard()

    expect(adminApi.getMetrics).toHaveBeenCalled()
    expect(adminApi.getUsers).toHaveBeenCalledWith(1)
  })
})
