import type { WorkoutPublic } from '@/interfaces/workout.interface'

function toWeekStartKey(date: Date): string {
  const copy = new Date(date)
  const day = copy.getDay()
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1)
  copy.setDate(diff)
  copy.setHours(0, 0, 0, 0)
  return copy.toISOString().slice(0, 10)
}

function shiftWeekKey(weekKey: string, weeks: number): string {
  const date = new Date(`${weekKey}T00:00:00`)
  date.setDate(date.getDate() + weeks * 7)
  return date.toISOString().slice(0, 10)
}

export function computeWeeklyStreak(workouts: WorkoutPublic[]): number {
  if (workouts.length === 0) {
    return 0
  }

  const weekKeys = new Set(workouts.map((workout) => toWeekStartKey(new Date(workout.date))))

  let streak = 0
  let cursor = toWeekStartKey(new Date())

  while (weekKeys.has(cursor)) {
    streak++
    cursor = shiftWeekKey(cursor, -1)
  }

  return streak
}

export function getLatestWorkout(workouts: WorkoutPublic[]): WorkoutPublic | null {
  if (workouts.length === 0) {
    return null
  }

  return (
    [...workouts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )[0] ?? null
  )
}
