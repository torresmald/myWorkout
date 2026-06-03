import type { TemplateExercisePublic, WorkoutTemplatePublic } from '@/interfaces/template.interface'

export function createTemplate(
  overrides: Partial<WorkoutTemplatePublic> = {},
): WorkoutTemplatePublic {
  return {
    id: 1,
    name: 'Push day',
    description: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-15T00:00:00.000Z',
    ...overrides,
  }
}

export function createTemplateExercise(
  overrides: Partial<TemplateExercisePublic> = {},
): TemplateExercisePublic {
  return {
    id: 20,
    templateId: 1,
    exerciseTypeId: 5,
    sets: 4,
    reps: 8,
    restSeconds: 120,
    weight: 60,
    sortOrder: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    exerciseType: { id: 5, name: 'Press banca', muscleGroup: 'CHEST' },
    ...overrides,
  }
}
