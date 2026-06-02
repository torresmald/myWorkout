import type { WorkoutSetPublic } from '../interfaces/workout-set.interface.js'

type RollupSet = Pick<WorkoutSetPublic, 'reps' | 'weight' | 'completedAt'>

export function computeRollupFromSets(
  sets: RollupSet[],
): { sets: number; reps: number; weight: number | null } | null {
  const completed = sets.filter((set) => set.completedAt !== null)

  if (completed.length === 0) {
    return null
  }

  const weightValues = completed
    .map((set) => set.weight)
    .filter((weight): weight is number => weight !== null && weight > 0)

  return {
    sets: completed.length,
    reps: completed[completed.length - 1]!.reps,
    weight: weightValues.length > 0 ? Math.max(...weightValues) : null,
  }
}

export function parseSetNumber(value: string): number | null {
  const setNumber = Number(value)
  return Number.isInteger(setNumber) && setNumber > 0 ? setNumber : null
}
