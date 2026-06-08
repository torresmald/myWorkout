import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import { useWeightUnitStore } from '@/stores/weight-unit.store'
import {
  convertWeightFromKg,
  convertWeightToKg,
  formatWeightValue,
  getWeightInputBounds,
  isValidDisplayWeight,
} from '@/utils/weight-unit.util'

export function useWeightDisplay() {
  const weightUnitStore = useWeightUnitStore()
  const { unit } = storeToRefs(weightUnitStore)
  const { t } = useI18n()

  const weightFieldLabel = computed(() =>
    unit.value === 'lb' ? t('common.weightLb') : t('common.weightKg'),
  )

  const inputBounds = computed(() => getWeightInputBounds(unit.value))

  function formatWeight(kg: number | null | undefined): string {
    return formatWeightValue(kg, unit.value)
  }

  function toDisplayValue(kg: number | null | undefined): string {
    if (kg === null || kg === undefined) {
      return ''
    }

    return String(convertWeightFromKg(kg, unit.value))
  }

  function toKg(displayValue: number): number {
    return convertWeightToKg(displayValue, unit.value)
  }

  function isValidWeight(displayValue: number): boolean {
    return isValidDisplayWeight(displayValue, unit.value)
  }

  return {
    unit,
    weightFieldLabel,
    inputBounds,
    formatWeight,
    toDisplayValue,
    toKg,
    isValidWeight,
    setUnit: weightUnitStore.setUnit,
  }
}
