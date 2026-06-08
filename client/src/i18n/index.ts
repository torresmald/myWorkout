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
