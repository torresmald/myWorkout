import type { UserPublic } from '@/interfaces/auth.interface'
import { useLocaleStore } from '@/stores/locale.store'
import { useThemeStore } from '@/stores/theme.store'
import { useWeightUnitStore } from '@/stores/weight-unit.store'

export function syncStoresFromUser(user: UserPublic): void {
  useLocaleStore().syncFromUser(user.locale)
  useThemeStore().syncFromUser(user.themeMode)
  useWeightUnitStore().syncFromUser(user.weightUnit)
}
