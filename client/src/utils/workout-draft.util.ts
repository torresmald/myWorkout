import type { ExerciseTypePublic } from '@/interfaces/exercise-type.interface'
import type {
  CreateWorkoutExerciseBody,
  DraftWorkoutExercise,
} from '@/interfaces/workout.interface'

export function createDraftExerciseLocalId(): string {
  return `draft-${crypto.randomUUID()}`
}

export function createDraftExercise(
  body: CreateWorkoutExerciseBody,
  exerciseType: Pick<ExerciseTypePublic, 'id' | 'name' | 'muscleGroup'>,
  localId = createDraftExerciseLocalId(),
): DraftWorkoutExercise {
  return {
    localId,
    exerciseTypeId: exerciseType.id,
    sets: body.sets ?? 1,
    reps: body.reps ?? 1,
    restSeconds: body.restSeconds ?? 0,
    weight: body.weight ?? null,
    sortOrder: body.sortOrder ?? 0,
    exerciseType: {
      id: exerciseType.id,
      name: exerciseType.name,
      muscleGroup: exerciseType.muscleGroup,
    },
  }
}

export function draftExercisesToCreateBody(
  exercises: DraftWorkoutExercise[],
): CreateWorkoutExerciseBody[] {
  return exercises.map((exercise, index) => ({
    exerciseTypeId: exercise.exerciseTypeId,
    sets: exercise.sets,
    reps: exercise.reps,
    restSeconds: exercise.restSeconds,
    weight: exercise.weight,
    sortOrder: exercise.sortOrder ?? index,
  }))
}

export function updateDraftExercise(
  exercise: DraftWorkoutExercise,
  body: CreateWorkoutExerciseBody,
  exerciseType: Pick<ExerciseTypePublic, 'id' | 'name' | 'muscleGroup'>,
): DraftWorkoutExercise {
  return createDraftExercise(body, exerciseType, exercise.localId)
}
