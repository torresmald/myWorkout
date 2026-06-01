import { createI18n } from 'vue-i18n'

import { FALLBACK_LOCALE } from '@/constants/locale.constants'
import en from '@/locales/en'
import es from '@/locales/es'
import { applyDocumentLocale, getInitialLocale } from '@/utils/locale.util'

const initialLocale = getInitialLocale()

applyDocumentLocale(initialLocale)

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: FALLBACK_LOCALE,
  messages: {
    es,
    en,
  },
})

export function setTheme() {
  const stored = localStorage.getItem('myworkout_theme')
  const dark =
    stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)
  if (dark) {
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
  }
}
