export const LOCALE_STORAGE_KEY = 'myworkout_locale'

export const SUPPORTED_LOCALES = ['es', 'en'] as const

export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: AppLocale = 'es'

export const FALLBACK_LOCALE: AppLocale = 'es'
