import { api } from '@/api/client'
import type { WorkoutStats } from '@/interfaces/stats.interface'

export function getWorkoutStats() {
  return api<WorkoutStats>('/stats')
}
