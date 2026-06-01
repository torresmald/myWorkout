import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { NAV_ITEMS } from '@/constants/nav.constants'

export function useNavItems() {
  const { t } = useI18n()

  return computed(() =>
    NAV_ITEMS.map((item) => ({
      ...item,
      label: t(item.labelKey),
    })),
  )
}
