import { api } from '@/api/client'
import type {
  UpdateWorkoutReminderBody,
  WorkoutReminderSettings,
} from '@/interfaces/reminder.interface'

export function getReminderSettings() {
  return api<WorkoutReminderSettings>('/profile/reminders')
}

export function updateReminderSettings(body: UpdateWorkoutReminderBody) {
  return api<WorkoutReminderSettings>('/profile/reminders', {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}
