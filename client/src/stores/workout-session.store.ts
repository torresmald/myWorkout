import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import * as workoutSessionApi from '@/api/workout-session.api'
import type {
  UpdateWorkoutSetBody,
  WorkoutSessionDetail,
  WorkoutSessionFinishResult,
} from '@/interfaces/workout-set.interface'

export const useWorkoutSessionStore = defineStore('workoutSession', () => {
  const session = ref<WorkoutSessionDetail | null>(null)
  const loading = ref(false)
  const starting = ref(false)
  const finishing = ref(false)
  const updatingSetKey = ref<string | null>(null)

  const completedSetCount = computed(() => {
    if (!session.value) {
      return 0
    }

    return session.value.exercises.reduce(
      (total, exercise) =>
        total + exercise.workoutSets.filter((set) => set.completedAt !== null).length,
      0,
    )
  })

  const totalSetCount = computed(() => {
    if (!session.value) {
      return 0
    }

    return session.value.exercises.reduce(
      (total, exercise) => total + exercise.workoutSets.length,
      0,
    )
  })

  async function load(workoutId: number) {
    loading.value = true

    try {
      session.value = await workoutSessionApi.getWorkoutSession(workoutId)
      return session.value
    } finally {
      loading.value = false
    }
  }

  async function start(workoutId: number) {
    starting.value = true

    try {
      session.value = await workoutSessionApi.startWorkoutSession(workoutId)
      return session.value
    } finally {
      starting.value = false
    }
  }

  async function finish(workoutId: number): Promise<WorkoutSessionFinishResult> {
    finishing.value = true

    try {
      const result = await workoutSessionApi.finishWorkoutSession(workoutId)
      if (session.value?.id === workoutId) {
        session.value = {
          ...session.value,
          status: result.status,
          completedAt: result.completedAt,
        }
      }
      return result
    } finally {
      finishing.value = false
    }
  }

  async function updateSet(
    workoutId: number,
    exerciseId: number,
    setNumber: number,
    body: UpdateWorkoutSetBody,
  ) {
    const key = `${exerciseId}-${setNumber}`
    updatingSetKey.value = key

    try {
      const result = await workoutSessionApi.updateWorkoutSet(
        workoutId,
        exerciseId,
        setNumber,
        body,
      )

      if (session.value?.id !== workoutId) {
        return result
      }

      session.value = {
        ...session.value,
        exercises: session.value.exercises.map((exercise) => {
          if (exercise.id !== exerciseId) {
            return exercise
          }

          return {
            ...exercise,
            workoutSets: exercise.workoutSets.map((set) =>
              set.setNumber === setNumber ? result.set : set,
            ),
          }
        }),
      }

      return result
    } finally {
      if (updatingSetKey.value === key) {
        updatingSetKey.value = null
      }
    }
  }

  function clear() {
    session.value = null
  }

  return {
    session,
    loading,
    starting,
    finishing,
    updatingSetKey,
    completedSetCount,
    totalSetCount,
    load,
    start,
    finish,
    updateSet,
    clear,
  }
})
