import type { CookieInventoryItem } from '@/interfaces/cookie-consent.interface'

export const COOKIE_CONSENT_STORAGE_KEY = 'myworkout_cookie_consent'

export const COOKIE_INVENTORY: CookieInventoryItem[] = [
  {
    key: 'myworkout_token',
    storage: 'localStorage',
    category: 'essential',
    durationKey: 'cookies.inventory.session',
  },
  {
    key: 'myworkout_refresh_token',
    storage: 'localStorage',
    category: 'essential',
    durationKey: 'cookies.inventory.refreshSession',
  },
  {
    key: 'myworkout_cookie_consent',
    storage: 'localStorage',
    category: 'essential',
    durationKey: 'cookies.inventory.consentRecord',
  },
  {
    key: 'myworkout_locale',
    storage: 'localStorage',
    category: 'preferences',
    durationKey: 'cookies.inventory.guestLocale',
  },
  {
    key: 'myworkout_onboarding_done',
    storage: 'localStorage',
    category: 'preferences',
    durationKey: 'cookies.inventory.persistent',
  },
  {
    key: 'sentry-*',
    storage: 'cookie',
    category: 'analytics',
    durationKey: 'cookies.inventory.analyticsSession',
    providerKey: 'cookies.providers.sentry',
  },
  {
    key: 'Google / GSI',
    storage: 'cookie',
    category: 'thirdParty',
    durationKey: 'cookies.inventory.thirdPartySession',
    providerKey: 'cookies.providers.google',
  },
]
