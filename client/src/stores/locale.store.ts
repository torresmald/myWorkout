import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

import { updatePreferences } from '@/api/profile.api'
import { type AppLocale } from '@/constants/locale.constants'
import { i18n } from '@/i18n'
import { applyLocale, getStoredLocale, isAppLocale } from '@/utils/locale.util'
import { getAccessToken } from '@/utils/storage.util'

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<AppLocale>(i18n.global.locale.value as AppLocale)
  const syncingFromServer = ref(false)

  function setLocale(nextLocale: AppLocale): void {
    locale.value = nextLocale
  }

  function toggleLocale(): void {
    setLocale(locale.value === 'es' ? 'en' : 'es')
  }

  function syncFromUser(userLocale: string): void {
    if (!isAppLocale(userLocale)) {
      return
    }

    syncingFromServer.value = true
    locale.value = userLocale
    applyLocale(userLocale)
    syncingFromServer.value = false
  }

  watch(locale, async (nextLocale) => {
    if (syncingFromServer.value) {
      return
    }

    applyLocale(nextLocale)

    if (!getAccessToken()) {
      return
    }

    try {
      await updatePreferences({ locale: nextLocale })
    } catch {
      // Keep UI locale even if persistence fails temporarily.
    }
  })

  return {
    locale,
    setLocale,
    toggleLocale,
    syncFromUser,
    isStoredLocale: () => getStoredLocale() !== null,
  }
})
