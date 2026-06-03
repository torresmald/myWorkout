import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import * as authApi from '@/api/auth.api'
import type { UserPublic } from '@/interfaces/auth.interface'
import { useAuthStore } from '@/stores/auth.store'
import * as storageUtil from '@/utils/storage.util'
import { onSessionRefreshed, refreshAccessToken } from '@/utils/refresh-session.util'

vi.mock('@/api/auth.api', () => ({
  getMe: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('@/utils/refresh-session.util', () => ({
  onSessionRefreshed: vi.fn(),
  refreshAccessToken: vi.fn(),
}))

const mockUser: UserPublic = {
  id: 1,
  email: 'user@example.com',
  name: 'Test User',
  role: 'USER',
  locale: 'es',
  createdAt: '2026-01-01T00:00:00.000Z',
  heightCm: null,
  profileImageUrl: null,
  spotifyPlaylistUrl: null,
  spotifyConnected: false,
  spotifyDisplayName: null,
  spotifyPlaylistName: null,
  latestWeightKg: null,
  bmi: null,
  bmiCategory: null,
}

describe('auth store - ensureAuthReady', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(onSessionRefreshed).mockImplementation(() => {})
    vi.mocked(refreshAccessToken).mockResolvedValue(null)
  })

  it('marca authReady como true cuando no hay sesión guardada', async () => {
    vi.spyOn(storageUtil, 'getAccessToken').mockReturnValue(null)
    vi.spyOn(storageUtil, 'getRefreshToken').mockReturnValue(null)

    const authStore = useAuthStore()

    expect(authStore.authReady).toBe(false)

    await authStore.ensureAuthReady()

    expect(authStore.authReady).toBe(true)
    expect(authStore.isAuthenticated).toBe(false)
    expect(authApi.getMe).not.toHaveBeenCalled()
  })

  it('marca authReady como true tras restaurar la sesión con getMe', async () => {
    vi.spyOn(storageUtil, 'getAccessToken').mockReturnValue('access-token')
    vi.spyOn(storageUtil, 'getRefreshToken').mockReturnValue(null)
    vi.mocked(authApi.getMe).mockResolvedValue(mockUser)

    const authStore = useAuthStore()

    await authStore.ensureAuthReady()

    expect(authStore.authReady).toBe(true)
    expect(authStore.user).toEqual(mockUser)
    expect(authStore.isAuthenticated).toBe(true)
  })
})
