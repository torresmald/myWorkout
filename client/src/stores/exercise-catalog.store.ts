import { ref } from 'vue'
import { defineStore } from 'pinia'

import * as exerciseCatalogApi from '@/api/exercise-catalog.api'
import type { ExerciseCatalogPublic, MuscleGroup } from '@/interfaces/exercise-catalog.interface'
import { useExerciseTypeStore } from '@/stores/exercise-type.store'

export const useExerciseCatalogStore = defineStore('exerciseCatalog', () => {
  const exerciseTypeStore = useExerciseTypeStore()

  const exercises = ref<ExerciseCatalogPublic[]>([])
  const loading = ref(false)
  const importingId = ref<number | null>(null)
  const selectedMuscleGroup = ref<MuscleGroup | null>(null)

  async function fetchAll(muscleGroup?: MuscleGroup | null) {
    loading.value = true
    selectedMuscleGroup.value = muscleGroup ?? null

    try {
      exercises.value = await exerciseCatalogApi.getExerciseCatalog(muscleGroup ?? undefined)
      return exercises.value
    } finally {
      loading.value = false
    }
  }

  async function importExercise(catalogId: number) {
    importingId.value = catalogId

    try {
      await exerciseCatalogApi.importExerciseFromCatalog(catalogId)
      await Promise.all([fetchAll(selectedMuscleGroup.value), exerciseTypeStore.fetchAll(true)])
    } finally {
      importingId.value = null
    }
  }

  return {
    exercises,
    loading,
    importingId,
    selectedMuscleGroup,
    fetchAll,
    importExercise,
  }
})
