export interface WorkoutReminderSettings {
  pushReminderEnabled: boolean
  emailReminderEnabled: boolean
  reminderDays: number[]
  reminderTimeLocal: string
  reminderTimezone: string
  workoutsLast7Days: number
}

export interface UpdateWorkoutReminderBody {
  pushReminderEnabled?: boolean
  emailReminderEnabled?: boolean
  reminderDays?: number[]
  reminderTimeLocal?: string
  reminderTimezone?: string
}
