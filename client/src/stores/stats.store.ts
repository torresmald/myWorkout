import { ref } from 'vue'
import { defineStore } from 'pinia'

import * as statsApi from '@/api/stats.api'
import type { WorkoutStats } from '@/interfaces/stats.interface'

export const useStatsStore = defineStore('stats', () => {
  const stats = ref<WorkoutStats | null>(null)
  const loading = ref(false)

  async function fetchStats() {
    loading.value = true

    try {
      stats.value = await statsApi.getWorkoutStats()
      return stats.value
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    loading,
    fetchStats,
  }
})
