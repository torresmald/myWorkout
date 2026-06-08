import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'

import { updatePreferences } from '@/api/profile.api'
import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import { applyLocale, getStoredLocale, isAppLocale } from '@/utils/locale.util'
import { getAccessToken } from '@/utils/storage.util'

vi.mock('@/utils/storage.util', () => ({
  getAccessToken: vi.fn(),
  getRefreshToken: vi.fn(),
  setTokens: vi.fn(),
  clearTokens: vi.fn(),
}))

vi.mock('vue', async (importOriginal) => {
  const vue = await importOriginal<typeof import('vue')>()
  return {
    ...vue,
    watch: (
      source: Parameters<typeof vue.watch>[0],
      callback: Parameters<typeof vue.watch>[1],
      options?: Parameters<typeof vue.watch>[2],
    ) => vue.watch(source, callback, { ...options, flush: 'sync' }),
  }
})

vi.mock('@/api/profile.api', () => ({
  updatePreferences: vi.fn(),
}))

vi.mock('@/utils/locale.util', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/locale.util')>()
  return {
    ...actual,
    applyLocale: vi.fn(),
    getStoredLocale: vi.fn(),
    isAppLocale: vi.fn((value: string) => value === 'es' || value === 'en'),
  }
})

async function loadLocaleStore() {
  vi.resetModules()
  setupTestPinia()
  const { useLocaleStore } = await import('@/stores/locale.store')
  return useLocaleStore()
}

describe('locale store', () => {
  beforeEach(() => {
    vi.mocked(getStoredLocale).mockReturnValue(null)
  })

  it('cambia el locale con setLocale', async () => {
    const store = await loadLocaleStore()

    store.setLocale('en')

    expect(store.locale).toBe('en')
  })

  it('alterna de en a es con toggleLocale', async () => {
    const store = await loadLocaleStore()
    store.setLocale('en')

    store.toggleLocale()

    expect(store.locale).toBe('es')
  })

  it('alterna el locale con toggleLocale', async () => {
    const store = await loadLocaleStore()
    store.setLocale('es')

    store.toggleLocale()

    expect(store.locale).toBe('en')
  })

  it('sincroniza el locale desde el usuario cuando es válido', async () => {
    const store = await loadLocaleStore()

    store.syncFromUser('en')

    expect(store.locale).toBe('en')
    expect(applyLocale).toHaveBeenCalledWith('en')
  })

  it('ignora syncFromUser cuando el locale no es válido', async () => {
    const store = await loadLocaleStore()
    store.setLocale('es')

    store.syncFromUser('fr')

    expect(store.locale).toBe('es')
    expect(applyLocale).not.toHaveBeenCalledWith('fr')
  })

  it('aplica el locale al cambiar sin token de acceso', async () => {
    vi.mocked(getAccessToken).mockReturnValue(null)
    const store = await loadLocaleStore()
    store.setLocale('es')
    await nextTick()

    store.toggleLocale()
    await nextTick()
    await flushPromises()

    expect(store.locale).toBe('en')
    expect(updatePreferences).not.toHaveBeenCalled()
  })

  it('persiste el locale en el perfil cuando hay token de acceso', async () => {
    vi.mocked(getAccessToken).mockReturnValue('access-token')
    vi.mocked(updatePreferences).mockResolvedValue({} as never)
    const store = await loadLocaleStore()
    store.setLocale('es')
    await nextTick()

    store.toggleLocale()
    await nextTick()
    await flushPromises()

    expect(updatePreferences).toHaveBeenCalledWith({ locale: 'en' })
  })

  it('mantiene el locale aunque falle la persistencia en el perfil', async () => {
    vi.mocked(getAccessToken).mockReturnValue('access-token')
    vi.mocked(updatePreferences).mockRejectedValue(new Error('network'))
    const store = await loadLocaleStore()
    store.setLocale('es')
    await nextTick()

    store.setLocale('en')
    await nextTick()
    await flushPromises()

    expect(store.locale).toBe('en')
  })

  it('indica si hay un locale almacenado', async () => {
    vi.mocked(getStoredLocale).mockReturnValue('es')
    const store = await loadLocaleStore()

    expect(store.isStoredLocale()).toBe(true)
  })

  it('no ejecuta el watch mientras sincroniza desde el servidor', async () => {
    vi.mocked(getAccessToken).mockReturnValue('access-token')
    const store = await loadLocaleStore()
    const nextLocale = store.locale === 'es' ? 'en' : 'es'

    store.syncFromUser(nextLocale)

    expect(updatePreferences).not.toHaveBeenCalled()
  })
})
