import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import { createUserPublic } from '@/__tests__/fixtures/profile.fixture'
import router from '@/router/index'
import { useAuthStore } from '@/stores/auth.store'
import type { UserPublic } from '@/interfaces/auth.interface'
import * as storageUtil from '@/utils/storage.util'
import * as documentTitleUtil from '@/utils/document-title.util'

const mockUser: UserPublic = createUserPublic({
  heightCm: null,
  latestWeightKg: null,
  bmi: null,
  bmiCategory: null,
})

function createAdminUser(): UserPublic {
  return { ...mockUser, role: 'ADMIN' }
}

function authenticateUser(user: UserPublic = mockUser) {
  const authStore = useAuthStore()
  authStore.$patch({
    token: 'access-token',
    refreshToken: 'refresh-token',
    user,
  })
}

describe('router - navigation guards', () => {
  beforeEach(async () => {
    setupTestPinia()
    const authStore = useAuthStore()
    vi.spyOn(authStore, 'ensureAuthReady').mockResolvedValue(undefined)
    localStorage.clear()
    vi.spyOn(storageUtil, 'getAccessToken').mockReturnValue(null)
    vi.spyOn(storageUtil, 'getRefreshToken').mockReturnValue(null)
    vi.spyOn(documentTitleUtil, 'updateDocumentTitle').mockImplementation(() => {})

    await router.push('/')
    await router.isReady()
  })

  it('redirige a login cuando la ruta requiere autenticación', async () => {
    await router.push('/workouts')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/workouts')
  })

  it('permite acceso a rutas autenticadas con sesión activa', async () => {
    authenticateUser()

    await router.push('/workouts')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('workouts')
  })

  it('redirige a home cuando un usuario autenticado visita login', async () => {
    authenticateUser()

    await router.push('/login')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('home')
  })

  it('redirige a home cuando un usuario autenticado visita register', async () => {
    authenticateUser()

    await router.push('/register')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('home')
  })

  it('redirige a home cuando un usuario sin rol admin visita admin', async () => {
    authenticateUser()

    await router.push('/admin')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('home')
  })

  it('permite acceso a admin cuando el usuario es ADMIN', async () => {
    authenticateUser(createAdminUser())

    await router.push('/admin')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('admin')
  })

  it('permite acceso a rutas públicas sin autenticación', async () => {
    await router.push('/cookies')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('cookies')
  })

  it('actualiza el título del documento tras cada navegación', async () => {
    authenticateUser()

    await router.push('/stats')
    await router.isReady()

    expect(documentTitleUtil.updateDocumentTitle).toHaveBeenCalled()
  })
})
