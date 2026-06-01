import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { COOKIE_CONSENT_STORAGE_KEY } from '@/constants/cookie.constants'
import type { CookieConsentPreferences } from '@/interfaces/cookie-consent.interface'

function createDefaultPreferences(): CookieConsentPreferences {
  return {
    essential: true,
    preferences: true,
    analytics: false,
    thirdParty: false,
    updatedAt: new Date().toISOString(),
  }
}

function parseStoredPreferences(raw: string | null): CookieConsentPreferences | null {
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsentPreferences>

    if (typeof parsed.analytics !== 'boolean' || typeof parsed.thirdParty !== 'boolean') {
      return null
    }

    return {
      essential: true,
      preferences: parsed.preferences ?? true,
      analytics: parsed.analytics,
      thirdParty: parsed.thirdParty,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export const useCookieConsentStore = defineStore('cookie-consent', () => {
  const stored = parseStoredPreferences(localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY))
  const preferences = ref<CookieConsentPreferences>(stored ?? createDefaultPreferences())
  const hasAnswered = ref(stored !== null)
  const preferencesModalOpen = ref(false)

  const showBanner = computed(() => !hasAnswered.value)

  function persist(next: CookieConsentPreferences) {
    preferences.value = next
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(next))
    hasAnswered.value = true
  }

  function acceptAll() {
    persist({
      essential: true,
      preferences: true,
      analytics: true,
      thirdParty: true,
      updatedAt: new Date().toISOString(),
    })
  }

  function rejectNonEssential() {
    persist({
      essential: true,
      preferences: true,
      analytics: false,
      thirdParty: false,
      updatedAt: new Date().toISOString(),
    })
  }

  function savePreferences(next: Pick<CookieConsentPreferences, 'analytics' | 'thirdParty'>) {
    persist({
      essential: true,
      preferences: true,
      analytics: next.analytics,
      thirdParty: next.thirdParty,
      updatedAt: new Date().toISOString(),
    })
    preferencesModalOpen.value = false
  }

  function openPreferences() {
    preferencesModalOpen.value = true
  }

  function closePreferences() {
    preferencesModalOpen.value = false
  }

  function hasAnalyticsConsent() {
    return preferences.value.analytics
  }

  function hasThirdPartyConsent() {
    return preferences.value.thirdParty
  }

  return {
    preferences,
    hasAnswered,
    showBanner,
    preferencesModalOpen,
    acceptAll,
    rejectNonEssential,
    savePreferences,
    openPreferences,
    closePreferences,
    hasAnalyticsConsent,
    hasThirdPartyConsent,
  }
})
