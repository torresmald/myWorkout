import { api } from '@/api/client'
import type {
  CreateWorkoutBody,
  CreateWorkoutExerciseBody,
  DuplicateWorkoutBody,
  UpdateWorkoutBody,
  UpdateWorkoutExerciseBody,
  WorkoutCreateResult,
  WorkoutExercisePublic,
  WorkoutListItem,
  WorkoutPublic,
} from '@/interfaces/workout.interface'

export function getWorkouts() {
  return api<WorkoutListItem[]>('/workouts')
}

export function createWorkout(body: CreateWorkoutBody) {
  return api<WorkoutCreateResult>('/workouts', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateWorkout(id: number, body: UpdateWorkoutBody) {
  return api<WorkoutPublic>(`/workouts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function deleteWorkout(id: number) {
  return api<WorkoutPublic>(`/workouts/${id}`, {
    method: 'DELETE',
  })
}

export function duplicateWorkout(id: number, body: DuplicateWorkoutBody = {}) {
  return api<WorkoutCreateResult>(`/workouts/${id}/duplicate`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function getWorkoutExercises(workoutId: number) {
  return api<WorkoutExercisePublic[]>(`/workouts/${workoutId}/exercises`)
}

export function createWorkoutExercise(workoutId: number, body: CreateWorkoutExerciseBody) {
  return api<WorkoutExercisePublic>(`/workouts/${workoutId}/exercises`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateWorkoutExercise(
  workoutId: number,
  exerciseId: number,
  body: UpdateWorkoutExerciseBody,
) {
  return api<WorkoutExercisePublic>(`/workouts/${workoutId}/exercises/${exerciseId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function deleteWorkoutExercise(workoutId: number, exerciseId: number) {
  return api<WorkoutExercisePublic>(`/workouts/${workoutId}/exercises/${exerciseId}`, {
    method: 'DELETE',
  })
}
