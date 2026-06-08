import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { WeightUnit } from '@/constants/weight-unit.constants'

export const useWeightUnitStore = defineStore('weight-unit', () => {
  const unit = ref<WeightUnit>('kg')

  function setUnit(nextUnit: WeightUnit): void {
    unit.value = nextUnit
  }

  function syncFromUser(nextUnit: WeightUnit): void {
    if (nextUnit === 'kg' || nextUnit === 'lb') {
      unit.value = nextUnit
    }
  }

  return {
    unit,
    setUnit,
    syncFromUser,
  }
})
