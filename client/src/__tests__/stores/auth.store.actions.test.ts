import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as authApi from '@/api/auth.api'
import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import type { LoginData, UserPublic } from '@/interfaces/auth.interface'
import { useAuthStore } from '@/stores/auth.store'
import { useLocaleStore } from '@/stores/locale.store'
import * as storageUtil from '@/utils/storage.util'
import { onSessionRefreshed, refreshAccessToken } from '@/utils/refresh-session.util'

vi.mock('@/api/auth.api', () => ({
  login: vi.fn(),
  loginWithGoogle: vi.fn(),
  register: vi.fn(),
  resendVerification: vi.fn(),
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
    targetWeightKg: null,
    profileImageUrl: null,
  spotifyPlaylistUrl: null,
  allowAutoPlaylist: false,
  restTimerSoundEnabled: true,
  showPrToast: true,
  confirmIncompleteFinish: true,
  spotifyConnected: false,
  spotifyDisplayName: null,
  spotifyPlaylistName: null,
  latestWeightKg: null,
  bmi: null,
  bmiCategory: null,
}

const loginData: LoginData = {
  token: 'access-token',
  refreshToken: 'refresh-token',
  user: mockUser,
}

describe('auth store - acciones y ciclo de sesión', () => {
  beforeEach(() => {
    setupTestPinia()
    vi.mocked(onSessionRefreshed).mockImplementation(() => {})
    vi.mocked(authApi.login).mockResolvedValue(loginData)
    vi.mocked(authApi.loginWithGoogle).mockResolvedValue(loginData)
    vi.mocked(authApi.register).mockResolvedValue({
      messageCode: 'REGISTER_CHECK_EMAIL',
      email: 'new@example.com',
    })
    vi.mocked(authApi.resendVerification).mockResolvedValue({
      messageCode: 'RESEND_VERIFICATION_SUCCESS',
    })
    vi.mocked(authApi.getMe).mockResolvedValue(mockUser)
    vi.mocked(authApi.logout).mockResolvedValue(null)
  })

  it('inicia sesión con credenciales', async () => {
    const authStore = useAuthStore()

    const user = await authStore.login({ email: 'user@example.com', password: 'secret' })

    expect(user).toEqual(mockUser)
    expect(authStore.isAuthenticated).toBe(true)
  })

  it('inicia sesión con Google usando el locale actual', async () => {
    const localeStore = useLocaleStore()
    localeStore.setLocale('en')
    const authStore = useAuthStore()

    await authStore.loginWithGoogle('google-id-token')

    expect(authApi.loginWithGoogle).toHaveBeenCalledWith('google-id-token', 'en')
    expect(authStore.user).toEqual(mockUser)
  })

  it('registra un usuario con el locale actual', async () => {
    const localeStore = useLocaleStore()
    localeStore.setLocale('es')
    const authStore = useAuthStore()

    await authStore.register({
      email: 'new@example.com',
      password: 'secret',
      name: 'New User',
    })

    expect(authApi.register).toHaveBeenCalledWith(
      expect.objectContaining({ locale: 'es' }),
    )
  })

  it('reenvía la verificación de email con el locale actual', async () => {
    const authStore = useAuthStore()

    await authStore.resendVerification('user@example.com')

    expect(authApi.resendVerification).toHaveBeenCalledWith('user@example.com', 'es')
  })

  it('obtiene el usuario autenticado con fetchMe', async () => {
    const authStore = useAuthStore()

    const user = await authStore.fetchMe()

    expect(user).toEqual(mockUser)
    expect(authStore.user).toEqual(mockUser)
  })

  it('actualiza el usuario con setUser', () => {
    const authStore = useAuthStore()

    authStore.setUser(mockUser)

    expect(authStore.user).toEqual(mockUser)
  })

  it('restaura la sesión con getMe cuando hay access token válido', async () => {
    vi.spyOn(storageUtil, 'getAccessToken').mockReturnValue('access-token')
    vi.spyOn(storageUtil, 'getRefreshToken').mockReturnValue('refresh-token')
    const authStore = useAuthStore()

    await authStore.initAuth()

    expect(authApi.getMe).toHaveBeenCalled()
    expect(authStore.user).toEqual(mockUser)
  })

  it('limpia la sesión cuando getMe falla y no hay refresh token', async () => {
    vi.spyOn(storageUtil, 'getAccessToken').mockReturnValue('expired-access-token')
    vi.spyOn(storageUtil, 'getRefreshToken').mockReturnValue(null)
    vi.mocked(authApi.getMe).mockRejectedValue(new Error('Unauthorized'))
    const authStore = useAuthStore()

    await authStore.initAuth()

    expect(authStore.isAuthenticated).toBe(false)
    expect(refreshAccessToken).not.toHaveBeenCalled()
  })

  it('restaura la sesión solo con refresh token cuando no hay access token', async () => {
    vi.spyOn(storageUtil, 'getAccessToken').mockReturnValue(null)
    vi.spyOn(storageUtil, 'getRefreshToken').mockReturnValue('refresh-token')
    vi.mocked(refreshAccessToken).mockResolvedValue(loginData)
    const authStore = useAuthStore()

    await authStore.initAuth()

    expect(authApi.getMe).not.toHaveBeenCalled()
    expect(authStore.isAuthenticated).toBe(true)
  })

  it('limpia la sesión cuando el refresh token no restaura la sesión', async () => {
    vi.spyOn(storageUtil, 'getAccessToken').mockReturnValue(null)
    vi.spyOn(storageUtil, 'getRefreshToken').mockReturnValue('refresh-token')
    vi.mocked(refreshAccessToken).mockResolvedValue(null)
    const authStore = useAuthStore()

    await authStore.initAuth()

    expect(authStore.isAuthenticated).toBe(false)
  })

  it('cierra sesión en el servidor cuando hay refresh token', async () => {
    const authStore = useAuthStore()
    authStore.$patch({
      token: 'access-token',
      refreshToken: 'refresh-token',
      user: mockUser,
    })

    await authStore.logout()

    expect(authApi.logout).toHaveBeenCalledWith('refresh-token')
    expect(authStore.isAuthenticated).toBe(false)
  })

  it('cierra sesión localmente aunque falle la petición al servidor', async () => {
    vi.mocked(authApi.logout).mockRejectedValue(new Error('network'))
    const authStore = useAuthStore()
    authStore.$patch({ refreshToken: 'refresh-token', user: mockUser, token: 'access-token' })

    await authStore.logout()

    expect(authStore.isAuthenticated).toBe(false)
  })

  it('cierra sesión sin llamar al servidor si no hay refresh token', async () => {
    const authStore = useAuthStore()
    authStore.$patch({ token: 'access-token', user: mockUser, refreshToken: null })
    vi.spyOn(storageUtil, 'getRefreshToken').mockReturnValue(null)

    await authStore.logout()

    expect(authApi.logout).not.toHaveBeenCalled()
  })

  it('reutiliza la promesa de ensureAuthReady en llamadas concurrentes', async () => {
    vi.spyOn(storageUtil, 'getAccessToken').mockReturnValue(null)
    vi.spyOn(storageUtil, 'getRefreshToken').mockReturnValue(null)
    const authStore = useAuthStore()

    await Promise.all([authStore.ensureAuthReady(), authStore.ensureAuthReady()])

    expect(authStore.authReady).toBe(true)
  })

  it('actualiza la sesión cuando se refresca externamente', () => {
    let refreshHandler: ((data: LoginData) => void) | undefined
    vi.mocked(onSessionRefreshed).mockImplementation((handler) => {
      refreshHandler = handler
    })

    const authStore = useAuthStore()

    refreshHandler?.(loginData)

    expect(authStore.user).toEqual(mockUser)
    expect(authStore.token).toBe('access-token')
  })
})
