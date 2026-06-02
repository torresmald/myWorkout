import { ref } from 'vue'
import { defineStore } from 'pinia'

import * as adminApi from '@/api/admin.api'
import type {
  AdminExerciseCatalogEntry,
  UpsertAdminExerciseCatalogBody,
} from '@/interfaces/admin-exercise-catalog.interface'

export const useAdminCatalogStore = defineStore('adminCatalog', () => {
  const entries = ref<AdminExerciseCatalogEntry[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const deletingId = ref<number | null>(null)

  async function fetchAll() {
    loading.value = true

    try {
      entries.value = await adminApi.getExerciseCatalog()
      return entries.value
    } finally {
      loading.value = false
    }
  }

  async function create(body: UpsertAdminExerciseCatalogBody) {
    saving.value = true

    try {
      const created = await adminApi.createExerciseCatalogEntry(body)
      await fetchAll()
      return created
    } finally {
      saving.value = false
    }
  }

  async function update(id: number, body: UpsertAdminExerciseCatalogBody) {
    saving.value = true

    try {
      const updated = await adminApi.updateExerciseCatalogEntry(id, body)
      await fetchAll()
      return updated
    } finally {
      saving.value = false
    }
  }

  async function remove(id: number) {
    deletingId.value = id

    try {
      const result = await adminApi.deleteExerciseCatalogEntry(id)
      await fetchAll()
      return result
    } finally {
      deletingId.value = null
    }
  }

  return {
    entries,
    loading,
    saving,
    deletingId,
    fetchAll,
    create,
    update,
    remove,
  }
})
