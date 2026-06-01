import { ref } from 'vue'
import { defineStore } from 'pinia'

import * as adminApi from '@/api/admin.api'
import type { AdminMetrics, AdminUserSummary } from '@/interfaces/admin.interface'
import type { UserRole } from '@/interfaces/role.interface'

export const useAdminStore = defineStore('admin', () => {
  const metrics = ref<AdminMetrics | null>(null)
  const users = ref<AdminUserSummary[]>([])
  const page = ref(1)
  const totalPages = ref(1)
  const total = ref(0)
  const loading = ref(false)
  const updatingUserId = ref<number | null>(null)

  async function fetchMetrics() {
    metrics.value = await adminApi.getMetrics()
  }

  async function fetchUsers(nextPage = page.value) {
    loading.value = true

    try {
      const result = await adminApi.getUsers(nextPage)
      users.value = result.users
      page.value = result.page
      totalPages.value = result.totalPages
      total.value = result.total
    } finally {
      loading.value = false
    }
  }

  async function changeUserRole(userId: number, role: UserRole) {
    updatingUserId.value = userId

    try {
      const updated = await adminApi.updateUserRole(userId, { role })
      const index = users.value.findIndex((user) => user.id === userId)
      if (index >= 0) {
        users.value[index] = updated
      }
      await fetchMetrics()
      return updated
    } finally {
      updatingUserId.value = null
    }
  }

  async function loadDashboard() {
    await Promise.all([fetchMetrics(), fetchUsers(1)])
  }

  return {
    metrics,
    users,
    page,
    totalPages,
    total,
    loading,
    updatingUserId,
    fetchMetrics,
    fetchUsers,
    changeUserRole,
    loadDashboard,
  }
})
