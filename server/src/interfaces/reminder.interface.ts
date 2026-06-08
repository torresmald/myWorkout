export interface WorkoutReminderSettings {
  pushReminderEnabled: boolean
  emailReminderEnabled: boolean
  plannedWorkoutReminderEnabled: boolean
  reminderDays: number[]
  reminderTimeLocal: string
  reminderTimezone: string
  workoutsLast7Days: number
  hasPlannedWorkoutToday: boolean
}

export interface UpdateWorkoutReminderBody {
  pushReminderEnabled?: boolean
  emailReminderEnabled?: boolean
  plannedWorkoutReminderEnabled?: boolean
  reminderDays?: number[]
  reminderTimeLocal?: string
  reminderTimezone?: string
}

export interface EmailReminderBatchResult {
  processed: number
  sent: number
  skipped: number
}
