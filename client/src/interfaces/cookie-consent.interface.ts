export type CookieConsentCategory = 'essential' | 'preferences' | 'analytics' | 'thirdParty'

export interface CookieConsentPreferences {
  essential: true
  preferences: boolean
  analytics: boolean
  thirdParty: boolean
  updatedAt: string
}

export interface CookieInventoryItem {
  key: string
  storage: 'localStorage' | 'cookie'
  category: CookieConsentCategory
  durationKey: string
  providerKey?: string
}
