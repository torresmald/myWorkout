type RecordCandidate = {
  exerciseTypeId: number
  exerciseName: string
  muscleGroup: string | null
  weight: number
  reps: number
  achievedAt: Date
  workoutId: number
  workoutName: string
}

export function pickBestRecord(candidates: RecordCandidate[]): RecordCandidate | null {
  if (candidates.length === 0) {
    return null
  }

  return candidates.reduce((best, current) => {
    if (current.weight > best.weight) {
      return current
    }

    if (current.weight === best.weight && current.achievedAt.getTime() > best.achievedAt.getTime()) {
      return current
    }

    return best
  })
}

export function groupBestRecordsByExerciseType(
  candidates: RecordCandidate[],
): Map<number, RecordCandidate> {
  const grouped = new Map<number, RecordCandidate[]>()

  for (const candidate of candidates) {
    const existing = grouped.get(candidate.exerciseTypeId) ?? []
    existing.push(candidate)
    grouped.set(candidate.exerciseTypeId, existing)
  }

  const bestByExercise = new Map<number, RecordCandidate>()

  for (const [exerciseTypeId, items] of grouped) {
    const best = pickBestRecord(items)

    if (best) {
      bestByExercise.set(exerciseTypeId, best)
    }
  }

  return bestByExercise
}
