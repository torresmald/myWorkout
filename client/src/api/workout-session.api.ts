import { api } from '@/api/client'
import type {
  UpdateWorkoutSetBody,
  WorkoutSessionDetail,
  WorkoutSessionFinishResult,
  WorkoutSetUpdateResult,
} from '@/interfaces/workout-set.interface'

export function getWorkoutSession(workoutId: number) {
  return api<WorkoutSessionDetail>(`/workouts/${workoutId}/session`)
}

export function startWorkoutSession(workoutId: number) {
  return api<WorkoutSessionDetail>(`/workouts/${workoutId}/start`, {
    method: 'POST',
  })
}

export function finishWorkoutSession(workoutId: number) {
  return api<WorkoutSessionFinishResult>(`/workouts/${workoutId}/finish`, {
    method: 'POST',
  })
}

export function updateWorkoutSet(
  workoutId: number,
  exerciseId: number,
  setNumber: number,
  body: UpdateWorkoutSetBody,
) {
  return api<WorkoutSetUpdateResult>(
    `/workouts/${workoutId}/exercises/${exerciseId}/sets/${setNumber}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  )
}
