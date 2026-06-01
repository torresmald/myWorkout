import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from '../constants/locale.constants.js'

function isAppLocale(value: string): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale)
}

export function parseAppLocale(value: unknown): AppLocale {
  if (typeof value !== 'string') {
    return DEFAULT_LOCALE
  }

  const normalized = value.trim().toLowerCase()

  if (isAppLocale(normalized)) {
    return normalized
  }

  if (normalized.startsWith('en')) {
    return 'en'
  }

  if (normalized.startsWith('es')) {
    return 'es'
  }

  return DEFAULT_LOCALE
}
