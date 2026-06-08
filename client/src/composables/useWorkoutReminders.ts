import { onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import { useAuthStore } from '@/stores/auth.store'
import { useReminderStore } from '@/stores/reminder.store'
import {
  getLocalDateKey,
  markPlannedPushReminderShownToday,
  markPushReminderShownToday,
  shouldShowPlannedWorkoutPushReminder,
  shouldShowPushReminder,
  showWorkoutReminderNotification,
} from '@/utils/reminder.util'

const CHECK_INTERVAL_MS = 60_000

export function useWorkoutReminders() {
  const authStore = useAuthStore()
  const reminderStore = useReminderStore()
  const { t } = useI18n()
  const { isAuthenticated } = storeToRefs(authStore)
  const { settings } = storeToRefs(reminderStore)

  let intervalId: ReturnType<typeof setInterval> | null = null

  async function refreshSettings() {
    if (!isAuthenticated.value) {
      return
    }

    try {
      await reminderStore.fetchSettings()
    } catch {
      // Silent: reminders are optional and should not block the app shell.
    }
  }

  function evaluatePushReminder() {
    if (!settings.value || !isAuthenticated.value) {
      return
    }

    const dateKey = getLocalDateKey(settings.value.reminderTimezone)

    if (shouldShowPlannedWorkoutPushReminder(settings.value)) {
      showWorkoutReminderNotification(
        t('reminders.plannedNotificationTitle'),
        t('reminders.plannedNotificationBody'),
        '/workouts',
      )
      markPlannedPushReminderShownToday(dateKey)
      return
    }

    if (!shouldShowPushReminder(settings.value)) {
      return
    }

    showWorkoutReminderNotification(
      t('reminders.notificationTitle'),
      t('reminders.notificationBody'),
      '/workouts',
    )
    markPushReminderShownToday(dateKey)
  }

  function startChecker() {
    stopChecker()
    intervalId = setInterval(() => {
      evaluatePushReminder()
    }, CHECK_INTERVAL_MS)
    evaluatePushReminder()
  }

  function stopChecker() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  watch(isAuthenticated, async (authenticated) => {
    if (authenticated) {
      await refreshSettings()
      startChecker()
      return
    }

    stopChecker()
  })

  onMounted(async () => {
    if (isAuthenticated.value) {
      await refreshSettings()
      startChecker()
    }
  })

  onUnmounted(() => {
    stopChecker()
  })

  return {
    refreshSettings,
    evaluatePushReminder,
  }
}
