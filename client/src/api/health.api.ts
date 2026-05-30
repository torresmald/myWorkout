import { api } from '@/api/client'
import type { HealthData } from '@/interfaces/health.interface'

export function getHealth() {
  return api<HealthData>('/health')
}
