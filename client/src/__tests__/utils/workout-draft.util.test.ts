import { describe, expect, it } from 'vitest'

import type { ExerciseTypePublic } from '@/interfaces/exercise-type.interface'
import {
  createDraftExercise,
  createDraftExerciseLocalId,
  draftExercisesToCreateBody,
  updateDraftExercise,
} from '@/utils/workout-draft.util'

const exerciseType: Pick<ExerciseTypePublic, 'id' | 'name' | 'muscleGroup'> = {
  id: 5,
  name: 'Press banca',
  muscleGroup: 'Pecho',
}

describe('workout-draft.util', () => {
  it('genera ids locales únicos para borradores', () => {
    const idA = createDraftExerciseLocalId()
    const idB = createDraftExerciseLocalId()

    expect(idA).toMatch(/^draft-/)
    expect(idB).not.toBe(idA)
  })

  it('crea ejercicio borrador con valores por defecto', () => {
    const draft = createDraftExercise({}, exerciseType, 'draft-1')

    expect(draft).toMatchObject({
      localId: 'draft-1',
      exerciseTypeId: 5,
      sets: 1,
      reps: 1,
      restSeconds: 0,
      weight: null,
      sortOrder: 0,
      exerciseType: {
        id: 5,
        name: 'Press banca',
        muscleGroup: 'Pecho',
      },
    })
  })

  it('convierte borradores a body de creación', () => {
    const draft = createDraftExercise(
      { sets: 3, reps: 10, restSeconds: 60, weight: 50 },
      exerciseType,
    )

    expect(draftExercisesToCreateBody([draft])).toEqual([
      {
        exerciseTypeId: 5,
        sets: 3,
        reps: 10,
        restSeconds: 60,
        weight: 50,
        sortOrder: 0,
      },
    ])
  })

  it('actualiza borrador conservando el localId', () => {
    const original = createDraftExercise({}, exerciseType, 'draft-keep')
    const updated = updateDraftExercise(
      original,
      { sets: 4, reps: 8 },
      exerciseType,
    )

    expect(updated.localId).toBe('draft-keep')
    expect(updated.sets).toBe(4)
    expect(updated.reps).toBe(8)
  })
})
