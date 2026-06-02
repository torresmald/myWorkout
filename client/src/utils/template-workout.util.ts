import type {
  CreateTemplateExerciseBody,
  TemplateExercisePublic,
} from '@/interfaces/template.interface'
import type {
  CreateWorkoutExerciseBody,
  WorkoutExercisePublic,
} from '@/interfaces/workout.interface'

type ExerciseLineSource = Pick<
  WorkoutExercisePublic | TemplateExercisePublic,
  'exerciseTypeId' | 'sets' | 'reps' | 'restSeconds' | 'weight' | 'sortOrder'
>

export function exerciseLinesToCreateBody(
  exercises: ExerciseLineSource[],
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

export function workoutExercisesToTemplateExercises(
  exercises: WorkoutExercisePublic[],
): CreateTemplateExerciseBody[] {
  return exerciseLinesToCreateBody(exercises)
}

export function templateExercisesToWorkoutExercises(
  exercises: TemplateExercisePublic[],
): CreateWorkoutExerciseBody[] {
  return exerciseLinesToCreateBody(exercises)
}
