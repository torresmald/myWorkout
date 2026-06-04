import type { Agent } from 'supertest'

import { authHeader } from './test-auth.js'

interface CreateTemplateOptions {
  name?: string
  description?: string
  exercises?: Array<{
    exerciseTypeId: number
    sets?: number
    reps?: number
    restSeconds?: number
    weight?: number | null
    sortOrder?: number
  }>
}

interface CreateTemplateExerciseOptions {
  exerciseTypeId: number
  sets?: number
  reps?: number
  restSeconds?: number
  weight?: number | null
  sortOrder?: number
}

export async function createTestTemplate(
  agent: Agent,
  token: string,
  options: CreateTemplateOptions = {},
) {
  const response = await agent
    .post('/api/templates')
    .set(authHeader(token))
    .send({
      name: options.name ?? 'Plantilla de prueba',
      description: options.description,
      exercises: options.exercises,
    })

  if (response.status !== 201) {
    throw new Error(`No se pudo crear plantilla: ${JSON.stringify(response.body)}`)
  }

  return response.body.data as { id: number; name: string; exercises?: unknown[] }
}

export async function createTestTemplateExercise(
  agent: Agent,
  token: string,
  templateId: number,
  options: CreateTemplateExerciseOptions,
) {
  const response = await agent
    .post(`/api/templates/${templateId}/exercises`)
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
    throw new Error(`No se pudo crear ejercicio de plantilla: ${JSON.stringify(response.body)}`)
  }

  return response.body.data as { id: number; sets: number; reps: number }
}
