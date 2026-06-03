import { beforeEach, describe, expect, it } from 'vitest'

import { COOKIE_CONSENT_STORAGE_KEY } from '@/constants/cookie.constants'
import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import { useCookieConsentStore } from '@/stores/cookie-consent.store'

describe('cookie-consent store', () => {
  beforeEach(() => {
    setupTestPinia()
  })

  it('inicializa con preferencias por defecto cuando no hay consentimiento guardado', () => {
    const store = useCookieConsentStore()

    expect(store.hasAnswered).toBe(false)
    expect(store.showBanner).toBe(true)
    expect(store.preferences.analytics).toBe(false)
    expect(store.preferences.thirdParty).toBe(false)
  })

  it('restaura preferencias sin updatedAt generando una fecha por defecto', () => {
    localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify({
        analytics: true,
        thirdParty: true,
      }),
    )

    const store = useCookieConsentStore()

    expect(store.preferences.updatedAt).toBeTruthy()
    expect(store.hasAnswered).toBe(true)
  })

  it('restaura preferencias válidas desde localStorage', () => {
    localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify({
        analytics: true,
        thirdParty: false,
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    )

    const store = useCookieConsentStore()

    expect(store.hasAnswered).toBe(true)
    expect(store.showBanner).toBe(false)
    expect(store.preferences.analytics).toBe(true)
    expect(store.preferences.essential).toBe(true)
  })

  it('ignora preferencias inválidas en localStorage', () => {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, 'not-json')
    const store = useCookieConsentStore()

    expect(store.hasAnswered).toBe(false)
    expect(store.showBanner).toBe(true)
  })

  it('ignora preferencias con campos booleanos inválidos', () => {
    localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify({ analytics: 'yes', thirdParty: false }),
    )

    const store = useCookieConsentStore()

    expect(store.hasAnswered).toBe(false)
  })

  it('acepta todas las cookies', () => {
    const store = useCookieConsentStore()

    store.acceptAll()

    expect(store.hasAnswered).toBe(true)
    expect(store.preferences.analytics).toBe(true)
    expect(store.preferences.thirdParty).toBe(true)
    expect(localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)).toContain('"analytics":true')
  })

  it('rechaza cookies no esenciales', () => {
    const store = useCookieConsentStore()

    store.rejectNonEssential()

    expect(store.preferences.analytics).toBe(false)
    expect(store.preferences.thirdParty).toBe(false)
  })

  it('guarda preferencias personalizadas y cierra el modal', () => {
    const store = useCookieConsentStore()
    store.openPreferences()

    store.savePreferences({ analytics: true, thirdParty: false })

    expect(store.preferences.analytics).toBe(true)
    expect(store.preferences.thirdParty).toBe(false)
    expect(store.preferencesModalOpen).toBe(false)
  })

  it('abre y cierra el modal de preferencias', () => {
    const store = useCookieConsentStore()

    store.openPreferences()
    expect(store.preferencesModalOpen).toBe(true)

    store.closePreferences()
    expect(store.preferencesModalOpen).toBe(false)
  })

  it('expone el consentimiento de analytics y terceros', () => {
    const store = useCookieConsentStore()

    store.savePreferences({ analytics: true, thirdParty: true })

    expect(store.hasAnalyticsConsent()).toBe(true)
    expect(store.hasThirdPartyConsent()).toBe(true)
  })
})
