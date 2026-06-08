import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import { updatePreferences } from '@/api/profile.api'
import { createUserPublic } from '@/__tests__/fixtures/profile.fixture'
import { getAccessToken } from '@/utils/storage.util'

vi.mock('@/api/profile.api', () => ({
  updatePreferences: vi.fn(),
}))

vi.mock('@/utils/storage.util', () => ({
  getAccessToken: vi.fn(),
  getRefreshToken: vi.fn(),
  setTokens: vi.fn(),
  clearTokens: vi.fn(),
}))

type MediaQueryListener = (event: MediaQueryListEvent) => void

function createMatchMediaMock(initialMatches: boolean) {
  let matches = initialMatches
  const listeners: MediaQueryListener[] = []

  return {
    get matches() {
      return matches
    },
    addEventListener: vi.fn((_event: string, listener: MediaQueryListener) => {
      listeners.push(listener)
    }),
    emitChange(nextMatches: boolean) {
      matches = nextMatches
      listeners.forEach((listener) => {
        listener({ matches: nextMatches } as MediaQueryListEvent)
      })
    },
  }
}

async function loadThemeStore() {
  vi.resetModules()
  const pinia = setupTestPinia()
  const { useAuthStore } = await import('@/stores/auth.store')
  const { useThemeStore } = await import('@/stores/theme.store')
  useAuthStore(pinia).setUser(createUserPublic())
  return useThemeStore(pinia)
}

describe('theme store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = ''
  })

  it('usa system por defecto', async () => {
    const matchMedia = createMatchMediaMock(false)
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(matchMedia))

    const store = await loadThemeStore()

    expect(store.mode).toBe('system')
    expect(store.resolvedTheme).toBe('light')
  })

  it('sincroniza el modo desde el usuario autenticado', async () => {
    const matchMedia = createMatchMediaMock(false)
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(matchMedia))

    const store = await loadThemeStore()
    store.syncFromUser('dark')

    expect(store.mode).toBe('dark')
    expect(store.resolvedTheme).toBe('dark')
  })

  it('alterna el tema resuelto y fija un modo explícito', async () => {
    const matchMedia = createMatchMediaMock(false)
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(matchMedia))

    const store = await loadThemeStore()
    store.toggleTheme()
    await nextTick()

    expect(store.mode).toBe('dark')
    expect(store.resolvedTheme).toBe('dark')
  })

  it('persiste el tema en el servidor cuando hay token de acceso', async () => {
    vi.mocked(getAccessToken).mockReturnValue('access-token')
    vi.mocked(updatePreferences).mockResolvedValue({
      locale: 'es',
      themeMode: 'dark',
      weightUnit: 'kg',
      allowAutoPlaylist: false,
      restTimerSoundEnabled: true,
      showPrToast: true,
      confirmIncompleteFinish: true,
      spotifyPlaylistUrl: null,
      spotifyConnected: false,
      spotifyDisplayName: null,
      spotifyPlaylistName: null,
    })

    const matchMedia = createMatchMediaMock(false)
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(matchMedia))

    const store = await loadThemeStore()
    store.setMode('dark')
    await nextTick()

    expect(updatePreferences).toHaveBeenCalledWith({ themeMode: 'dark' })
  })

  it('actualiza el tema resuelto en modo system cuando cambia el sistema', async () => {
    const matchMedia = createMatchMediaMock(false)
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(matchMedia))

    const store = await loadThemeStore()
    store.initSystemListener()

    matchMedia.emitChange(true)

    expect(store.resolvedTheme).toBe('dark')
  })
})
