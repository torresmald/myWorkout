import { ref } from 'vue'
import { defineStore } from 'pinia'

import * as reminderApi from '@/api/reminder.api'
import type {
  UpdateWorkoutReminderBody,
  WorkoutReminderSettings,
} from '@/interfaces/reminder.interface'

export const useReminderStore = defineStore('reminder', () => {
  const settings = ref<WorkoutReminderSettings | null>(null)
  const loading = ref(false)
  const saving = ref(false)

  async function fetchSettings() {
    loading.value = true

    try {
      settings.value = await reminderApi.getReminderSettings()
      return settings.value
    } finally {
      loading.value = false
    }
  }

  async function saveSettings(body: UpdateWorkoutReminderBody) {
    saving.value = true

    try {
      settings.value = await reminderApi.updateReminderSettings(body)
      return settings.value
    } finally {
      saving.value = false
    }
  }

  return {
    settings,
    loading,
    saving,
    fetchSettings,
    saveSettings,
  }
})
