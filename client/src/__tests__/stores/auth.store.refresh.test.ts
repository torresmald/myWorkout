import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import * as authApi from '@/api/auth.api'
import { createUserPublic } from '@/__tests__/fixtures/profile.fixture'
import type { LoginData, UserPublic } from '@/interfaces/auth.interface'
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

const mockUser: UserPublic = createUserPublic({
  heightCm: null,
  latestWeightKg: null,
  bmi: null,
  bmiCategory: null,
})

const refreshedSession: LoginData = {
  token: 'new-access-token',
  refreshToken: 'new-refresh-token',
  user: mockUser,
}

describe('auth store - refresh de sesión', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(onSessionRefreshed).mockImplementation(() => {})
  })

  it('restaura la sesión con refresh cuando getMe falla', async () => {
    vi.spyOn(storageUtil, 'getAccessToken').mockReturnValue('expired-access-token')
    vi.spyOn(storageUtil, 'getRefreshToken').mockReturnValue('refresh-token')
    vi.mocked(authApi.getMe).mockRejectedValue(new Error('Unauthorized'))
    vi.mocked(refreshAccessToken).mockResolvedValue(refreshedSession)

    const authStore = useAuthStore()

    await authStore.ensureAuthReady()

    expect(authApi.getMe).toHaveBeenCalled()
    expect(refreshAccessToken).toHaveBeenCalled()
    expect(authStore.user).toEqual(mockUser)
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.authReady).toBe(true)
  })
})
