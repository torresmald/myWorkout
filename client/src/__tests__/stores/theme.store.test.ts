import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import { THEME_STORAGE_KEY } from '@/constants/theme.constants'

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
  setupTestPinia()
  const { useThemeStore } = await import('@/stores/theme.store')
  return useThemeStore()
}

describe('theme store', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = ''
  })

  it('usa el tema almacenado en localStorage', async () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    const matchMedia = createMatchMediaMock(false)
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(matchMedia))

    const store = await loadThemeStore()

    expect(store.preference).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('usa el tema del sistema cuando no hay preferencia almacenada', async () => {
    const matchMedia = createMatchMediaMock(true)
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(matchMedia))

    const store = await loadThemeStore()

    expect(store.preference).toBe('dark')
  })

  it('alterna de dark a light cuando el tema actual es oscuro', async () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    const matchMedia = createMatchMediaMock(true)
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(matchMedia))

    const store = await loadThemeStore()
    store.toggleTheme()
    await nextTick()

    expect(store.preference).toBe('light')
    expect(store.isDark()).toBe(false)
  })

  it('alterna el tema y lo persiste en localStorage', async () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    const matchMedia = createMatchMediaMock(false)
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(matchMedia))

    const store = await loadThemeStore()
    store.toggleTheme()
    await nextTick()

    expect(store.preference).toBe('dark')
    expect(store.isDark()).toBe(true)
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
  })

  it('ignora valores inválidos en localStorage y usa el tema del sistema', async () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'invalid')
    const matchMedia = createMatchMediaMock(true)
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(matchMedia))

    const store = await loadThemeStore()

    expect(store.preference).toBe('dark')
  })

  it('actualiza el tema según el sistema si no hay preferencia guardada', async () => {
    const matchMedia = createMatchMediaMock(false)
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(matchMedia))

    const store = await loadThemeStore()
    store.initSystemListener()

    matchMedia.emitChange(true)

    expect(store.preference).toBe('dark')
  })

  it('cambia a light cuando el sistema deja de preferir oscuro', async () => {
    const matchMedia = createMatchMediaMock(true)
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(matchMedia))

    const store = await loadThemeStore()
    store.initSystemListener()

    matchMedia.emitChange(false)

    expect(store.preference).toBe('light')
  })

  it('no cambia el tema del sistema si hay preferencia guardada', async () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    const matchMedia = createMatchMediaMock(false)
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(matchMedia))

    const store = await loadThemeStore()
    store.initSystemListener()

    matchMedia.emitChange(true)

    expect(store.preference).toBe('light')
  })
})
