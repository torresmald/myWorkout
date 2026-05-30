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
import { sortByDateDesc, sortExercises } from '@/utils/date.util'

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

  async function fetchAll() {
    loading.value = true

    try {
      workouts.value = await workoutApi.getWorkouts()
    } finally {
      loading.value = false
    }
  }

  async function create(body: CreateWorkoutBody) {
    creating.value = true

    try {
      const created = await workoutApi.createWorkout(body)
      workouts.value = sortByDateDesc([...workouts.value, created])
      return created
    } finally {
      creating.value = false
    }
  }

  async function update(id: number, body: UpdateWorkoutBody) {
    updating.value = true

    try {
      const updated = await workoutApi.updateWorkout(id, body)
      workouts.value = sortByDateDesc(
        workouts.value.map((item) => (item.id === id ? updated : item)),
      )
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

  async function fetchExercises(workoutId: number) {
    loadingExercises.value = true
    activeWorkoutId.value = workoutId

    try {
      exercises.value = await workoutApi.getWorkoutExercises(workoutId)
    } finally {
      loadingExercises.value = false
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
      exercises.value = sortExercises(exercises.value.concat(created))
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
      exercises.value = sortExercises(
        exercises.value.map((item) => (item.id === exerciseId ? updated : item)),
      )
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
    createExercise,
    updateExercise,
    removeExercise,
  }
})
