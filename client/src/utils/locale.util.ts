import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  type AppLocale,
} from '@/constants/locale.constants'
import { i18n } from '@/i18n'

export function applyLocale(locale: AppLocale): void {
  i18n.global.locale.value = locale
  localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  applyDocumentLocale(locale)
}

export function isAppLocale(value: string): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale)
}

function detectBrowserLocale(): AppLocale {
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language]

  for (const language of languages) {
    const normalized = language.toLowerCase()

    if (normalized.startsWith('en')) {
      return 'en'
    }

    if (normalized.startsWith('es')) {
      return 'es'
    }
  }

  return DEFAULT_LOCALE
}

export function getStoredLocale(): AppLocale | null {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)

  if (stored && isAppLocale(stored)) {
    return stored
  }

  return null
}

export function getInitialLocale(): AppLocale {
  return getStoredLocale() ?? detectBrowserLocale()
}

export function applyDocumentLocale(locale: AppLocale): void {
  document.documentElement.lang = locale
}
