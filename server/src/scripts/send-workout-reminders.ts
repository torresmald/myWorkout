import '../config/env.js'

import { processEmailWorkoutReminders } from '../services/reminder.service.js'

const result = await processEmailWorkoutReminders()

console.log(
  `Workout email reminders processed=${result.processed} sent=${result.sent} skipped=${result.skipped}`,
)
