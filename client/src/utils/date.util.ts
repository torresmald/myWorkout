import type { WorkoutExercisePublic, WorkoutPublic } from '@/interfaces/workout.interface'

export function isoToDateInputValue(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10)
}

export function todayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10)
}

export function dateInputToIso(date: string): string {
  return new Date(`${date}T12:00:00`).toISOString()
}

export function formatWorkoutDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function sortByDateDesc(items: WorkoutPublic[]) {
  return [...items].sort(
    (a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime() || a.name.localeCompare(b.name),
  )
}

export function sortExercises(items: WorkoutExercisePublic[]) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
}
