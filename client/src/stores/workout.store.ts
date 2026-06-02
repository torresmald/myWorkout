import { ref } from 'vue'
import { defineStore } from 'pinia'

import * as workoutApi from '@/api/workout.api'
import type {
  CreateWorkoutBody,
  CreateWorkoutExerciseBody,
  UpdateWorkoutBody,
  UpdateWorkoutExerciseBody,
  WorkoutExercisePublic,
  WorkoutPublic,
} from '@/interfaces/workout.interface'

export const useWorkoutStore = defineStore('workout', () => {
  const workouts = ref<WorkoutPublic[]>([])
  const exercises = ref<WorkoutExercisePublic[]>([])
  const activeWorkoutId = ref<number | null>(null)

  const loading = ref(false)
  const creating = ref(false)
  const updating = ref(false)
  const deletingId = ref<number | null>(null)

  const loadingExercises = ref(false)
  const creatingExercise = ref(false)
  const updatingExerciseId = ref<number | null>(null)
  const deletingExerciseId = ref<number | null>(null)

  async function fetchAll(silent = false) {
    if (!silent) {
      loading.value = true
    }

    try {
      workouts.value = await workoutApi.getWorkouts()
    } finally {
      if (!silent) {
        loading.value = false
      }
    }
  }

  async function create(body: CreateWorkoutBody) {
    creating.value = true

    try {
      const created = await workoutApi.createWorkout(body)
      await fetchAll(true)
      return created
    } finally {
      creating.value = false
    }
  }

  function hydrateExercises(workoutId: number, items?: WorkoutExercisePublic[]) {
    activeWorkoutId.value = workoutId

    if (items !== undefined) {
      exercises.value = items
    }
  }

  async function update(id: number, body: UpdateWorkoutBody) {
    updating.value = true

    try {
      const updated = await workoutApi.updateWorkout(id, body)
      await fetchAll(true)
      return updated
    } finally {
      updating.value = false
    }
  }

  async function remove(id: number) {
    deletingId.value = id

    try {
      await workoutApi.deleteWorkout(id)
      workouts.value = workouts.value.filter((item) => item.id !== id)

      if (activeWorkoutId.value === id) {
        clearExercises()
      }
    } finally {
      deletingId.value = null
    }
  }

  async function fetchExercises(workoutId: number, silent = false) {
    if (!silent) {
      loadingExercises.value = true
    }

    activeWorkoutId.value = workoutId

    try {
      exercises.value = await workoutApi.getWorkoutExercises(workoutId)
    } finally {
      if (!silent) {
        loadingExercises.value = false
      }
    }
  }

  function clearExercises() {
    exercises.value = []
    activeWorkoutId.value = null
  }

  async function createExercise(workoutId: number, body: CreateWorkoutExerciseBody) {
    creatingExercise.value = true

    try {
      const created = await workoutApi.createWorkoutExercise(workoutId, body)
      await fetchExercises(workoutId, true)
      return created
    } finally {
      creatingExercise.value = false
    }
  }

  async function updateExercise(
    workoutId: number,
    exerciseId: number,
    body: UpdateWorkoutExerciseBody,
  ) {
    updatingExerciseId.value = exerciseId

    try {
      const updated = await workoutApi.updateWorkoutExercise(workoutId, exerciseId, body)
      await fetchExercises(workoutId, true)
      return updated
    } finally {
      updatingExerciseId.value = null
    }
  }

  async function removeExercise(workoutId: number, exerciseId: number) {
    deletingExerciseId.value = exerciseId

    try {
      await workoutApi.deleteWorkoutExercise(workoutId, exerciseId)
      exercises.value = exercises.value.filter((item) => item.id !== exerciseId)
    } finally {
      deletingExerciseId.value = null
    }
  }

  return {
    workouts,
    exercises,
    activeWorkoutId,
    loading,
    creating,
    updating,
    deletingId,
    loadingExercises,
    creatingExercise,
    updatingExerciseId,
    deletingExerciseId,
    fetchAll,
    create,
    update,
    remove,
    fetchExercises,
    clearExercises,
    hydrateExercises,
    createExercise,
    updateExercise,
    removeExercise,
  }
})
