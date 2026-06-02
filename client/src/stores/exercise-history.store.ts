import { ref } from 'vue'
import { defineStore } from 'pinia'

import * as exerciseHistoryApi from '@/api/exercise-history.api'
import type { ExerciseHistoryDetail } from '@/interfaces/exercise-history.interface'

export const useExerciseHistoryStore = defineStore('exerciseHistory', () => {
  const history = ref<ExerciseHistoryDetail | null>(null)
  const loading = ref(false)

  async function fetchByExerciseType(exerciseTypeId: number) {
    loading.value = true

    try {
      history.value = await exerciseHistoryApi.getExerciseHistory(exerciseTypeId)
      return history.value
    } finally {
      loading.value = false
    }
  }

  function clear() {
    history.value = null
  }

  return {
    history,
    loading,
    fetchByExerciseType,
    clear,
  }
})
