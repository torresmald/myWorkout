import { ref } from 'vue'
import { defineStore } from 'pinia'

import * as exerciseTypeApi from '@/api/exercise-type.api'
import type {
  CreateExerciseTypeBody,
  ExerciseTypePublic,
  UpdateExerciseTypeBody,
} from '@/interfaces/exercise-type.interface'

export const useExerciseTypeStore = defineStore('exerciseType', () => {
  const exerciseTypes = ref<ExerciseTypePublic[]>([])
  const loading = ref(false)
  const creating = ref(false)
  const updating = ref(false)
  const deletingId = ref<number | null>(null)

  async function fetchAll(silent = false) {
    if (!silent) {
      loading.value = true
    }

    try {
      exerciseTypes.value = await exerciseTypeApi.getExerciseTypes()
    } finally {
      if (!silent) {
        loading.value = false
      }
    }
  }

  async function create(body: CreateExerciseTypeBody) {
    creating.value = true

    try {
      const created = await exerciseTypeApi.createExerciseType(body)
      await fetchAll(true)
      return created
    } finally {
      creating.value = false
    }
  }

  async function update(id: number, body: UpdateExerciseTypeBody) {
    updating.value = true

    try {
      const updated = await exerciseTypeApi.updateExerciseType(id, body)
      await fetchAll(true)
      return updated
    } finally {
      updating.value = false
    }
  }

  async function remove(id: number) {
    deletingId.value = id

    try {
      await exerciseTypeApi.deleteExerciseType(id)
      exerciseTypes.value = exerciseTypes.value.filter((item) => item.id !== id)
    } finally {
      deletingId.value = null
    }
  }

  return {
    exerciseTypes,
    loading,
    creating,
    updating,
    deletingId,
    fetchAll,
    create,
    update,
    remove,
  }
})
