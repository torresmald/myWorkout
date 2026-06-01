import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { HOME_QUICK_LINKS } from '@/constants/home.constants'

export function useHomeQuickLinks() {
  const { t } = useI18n()

  return computed(() =>
    HOME_QUICK_LINKS.map((link) => ({
      ...link,
      label: t(link.labelKey),
      description: t(link.descriptionKey),
    })),
  )
}
