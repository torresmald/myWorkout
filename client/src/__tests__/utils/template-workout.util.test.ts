import { describe, expect, it } from 'vitest'

import type { TemplateExercisePublic } from '@/interfaces/template.interface'
import type { WorkoutExercisePublic } from '@/interfaces/workout.interface'
import {
  exerciseLinesToCreateBody,
  templateExercisesToWorkoutExercises,
  workoutExercisesToTemplateExercises,
} from '@/utils/template-workout.util'

const line = {
  exerciseTypeId: 1,
  sets: 3,
  reps: 10,
  restSeconds: 60,
  weight: 40,
  sortOrder: 0,
}

describe('template-workout.util', () => {
  it('convierte líneas de ejercicio a body de creación', () => {
    expect(exerciseLinesToCreateBody([line])).toEqual([
      {
        exerciseTypeId: 1,
        sets: 3,
        reps: 10,
        restSeconds: 60,
        weight: 40,
        sortOrder: 0,
      },
    ])
  })

  it('asigna sortOrder por índice cuando falta', () => {
    const result = exerciseLinesToCreateBody([
      { ...line, sortOrder: undefined as unknown as number },
      { ...line, exerciseTypeId: 2, sortOrder: undefined as unknown as number },
    ])

    expect(result[0]!.sortOrder).toBe(0)
  })

  it('convierte ejercicios de entrenamiento a plantilla', () => {
    const workoutExercise = {
      ...line,
      id: 10,
      workoutId: 2,
      exerciseType: { id: 1, name: 'Sentadilla', muscleGroup: 'Piernas' },
    } as WorkoutExercisePublic

    expect(workoutExercisesToTemplateExercises([workoutExercise])).toEqual([
      exerciseLinesToCreateBody([workoutExercise])[0],
    ])
  })

  it('convierte ejercicios de plantilla a entrenamiento', () => {
    const templateExercise = {
      ...line,
      id: 20,
      templateId: 3,
      exerciseType: { id: 1, name: 'Sentadilla', muscleGroup: 'Piernas' },
    } as TemplateExercisePublic

    expect(templateExercisesToWorkoutExercises([templateExercise])).toEqual([
      exerciseLinesToCreateBody([templateExercise])[0],
    ])
  })
})
