import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { adminRoutes } from '@/__tests__/helpers/test-routes'
import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import * as adminApi from '@/api/admin.api'
import AdminView from '@/views/AdminView.vue'
import { i18n } from '@/i18n'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { createUserPublic } from '@/__tests__/fixtures/profile.fixture'

vi.mock('@/api/admin.api', () => ({
  getMetrics: vi.fn(),
  getUsers: vi.fn(),
  updateUserRole: vi.fn(),
}))

const mockMetrics = {
  totalUsers: 100,
  verifiedUsers: 80,
  adminUsers: 2,
  totalWorkouts: 500,
  totalExerciseTypes: 50,
  totalWeightEntries: 200,
  totalCatalogExercises: 120,
}

const mockUser = {
  id: 2,
  email: 'other@example.com',
  name: 'Other User',
  role: 'USER' as const,
  emailVerifiedAt: '2026-01-01T00:00:00.000Z',
  lastLoginAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  workoutCount: 10,
}

describe('AdminView', () => {
  beforeEach(() => {
    vi.mocked(adminApi.getMetrics).mockResolvedValue(mockMetrics)
    vi.mocked(adminApi.getUsers).mockResolvedValue({
      users: [mockUser],
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 2,
    })
    vi.mocked(adminApi.updateUserRole).mockResolvedValue({ ...mockUser, role: 'ADMIN' })
  })

  it('muestra métricas y usuarios', async () => {
    const { pinia, wrapper } = await mountWithPlugins(AdminView, {
      routes: adminRoutes,
      initialRoute: '/admin',
    })
    useAuthStore(pinia).setUser(createUserPublic({ id: 1 }))

    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('admin.metrics.totalUsers'))
    expect(wrapper.text()).toContain('100')
    expect(wrapper.text()).toContain('other@example.com')
  })

  it('cambia rol de usuario', async () => {
    const { pinia, wrapper } = await mountWithPlugins(AdminView, {
      routes: adminRoutes,
      initialRoute: '/admin',
    })
    useAuthStore(pinia).setUser(createUserPublic({ id: 1 }))
    const toastStore = useToastStore(pinia)
    const successSpy = vi.spyOn(toastStore, 'success')

    await flushPromises()

    await wrapper.find('select').setValue('ADMIN')
    await flushPromises()

    expect(adminApi.updateUserRole).toHaveBeenCalled()
    expect(successSpy).toHaveBeenCalledWith(i18n.global.t('admin.roleUpdated'))
  })

  it('navega entre páginas de usuarios', async () => {
    const { wrapper } = await mountWithPlugins(AdminView, {
      routes: adminRoutes,
      initialRoute: '/admin',
    })

    await flushPromises()

    const nextButton = wrapper.findAll('button').find((b) =>
      b.text().includes(i18n.global.t('common.next')),
    )
    await nextButton!.trigger('click')
    await flushPromises()

    expect(adminApi.getUsers).toHaveBeenCalledWith(2)
  })
})
