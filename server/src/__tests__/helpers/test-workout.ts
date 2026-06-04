import type { Agent } from 'supertest'

import { authHeader } from './test-auth.js'

interface CreateWorkoutOptions {
  name?: string
  date?: string
  notes?: string
}

interface CreateExerciseTypeOptions {
  name?: string
  muscleGroup?: string
}

interface CreateWorkoutExerciseOptions {
  exerciseTypeId: number
  sets?: number
  reps?: number
  restSeconds?: number
  weight?: number | null
  sortOrder?: number
}

export async function createTestExerciseType(
  agent: Agent,
  token: string,
  options: CreateExerciseTypeOptions = {},
) {
  const response = await agent
    .post('/api/exercise-types')
    .set(authHeader(token))
    .send({
      name: options.name ?? 'Press banca',
      muscleGroup: options.muscleGroup ?? 'CHEST',
    })

  if (response.status !== 201) {
    throw new Error(`No se pudo crear tipo de ejercicio: ${JSON.stringify(response.body)}`)
  }

  return response.body.data as { id: number; name: string }
}

export async function createTestWorkout(
  agent: Agent,
  token: string,
  options: CreateWorkoutOptions = {},
) {
  const response = await agent
    .post('/api/workouts')
    .set(authHeader(token))
    .send({
      name: options.name ?? 'Entreno de prueba',
      date: options.date ?? '2026-05-30',
      notes: options.notes,
    })

  if (response.status !== 201) {
    throw new Error(`No se pudo crear entrenamiento: ${JSON.stringify(response.body)}`)
  }

  return response.body.data as { id: number; name: string; status: string }
}

export async function createTestWorkoutExercise(
  agent: Agent,
  token: string,
  workoutId: number,
  options: CreateWorkoutExerciseOptions,
) {
  const response = await agent
    .post(`/api/workouts/${workoutId}/exercises`)
    .set(authHeader(token))
    .send({
      sets: options.sets ?? 3,
      reps: options.reps ?? 10,
      restSeconds: options.restSeconds ?? 90,
      weight: options.weight ?? 60,
      sortOrder: options.sortOrder ?? 0,
      exerciseTypeId: options.exerciseTypeId,
    })

  if (response.status !== 201) {
    throw new Error(`No se pudo crear ejercicio del entrenamiento: ${JSON.stringify(response.body)}`)
  }

  return response.body.data as { id: number; sets: number; reps: number }
}
