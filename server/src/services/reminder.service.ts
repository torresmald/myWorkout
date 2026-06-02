import { ErrorCode } from '../constants/error-codes.constants.js'
import { prisma } from '../config/prisma.js'
import { AppError } from '../interfaces/app-error.interface.js'
import type {
  EmailReminderBatchResult,
  UpdateWorkoutReminderBody,
  WorkoutReminderSettings,
} from '../interfaces/reminder.interface.js'
import { parseAppLocale } from '../utils/locale.util.js'
import {
  getLocalTimeParts,
  getSevenDaysAgo,
  isReminderDay,
  isReminderHour,
  isValidReminderTime,
  normalizeReminderDays,
  wasEmailReminderSentToday,
} from '../utils/reminder.util.js'
import { sendWorkoutReminderEmail } from './mail.service.js'

const reminderUserSelect = {
  id: true,
  email: true,
  name: true,
  locale: true,
  pushReminderEnabled: true,
  emailReminderEnabled: true,
  reminderDays: true,
  reminderTimeLocal: true,
  reminderTimezone: true,
  lastEmailReminderSentAt: true,
} as const

async function countWorkoutsLast7Days(userId: number): Promise<number> {
  return prisma.workout.count({
    where: {
      userId,
      date: { gte: getSevenDaysAgo() },
    },
  })
}

function mapReminderSettings(
  user: {
    pushReminderEnabled: boolean
    emailReminderEnabled: boolean
    reminderDays: number[]
    reminderTimeLocal: string
    reminderTimezone: string
  },
  workoutsLast7Days: number,
): WorkoutReminderSettings {
  return {
    pushReminderEnabled: user.pushReminderEnabled,
    emailReminderEnabled: user.emailReminderEnabled,
    reminderDays: user.reminderDays,
    reminderTimeLocal: user.reminderTimeLocal,
    reminderTimezone: user.reminderTimezone,
    workoutsLast7Days,
  }
}

function validateReminderPayload(body: UpdateWorkoutReminderBody) {
  const pushEnabled = body.pushReminderEnabled ?? false
  const emailEnabled = body.emailReminderEnabled ?? false
  const days = body.reminderDays !== undefined ? normalizeReminderDays(body.reminderDays) : []
  const time = body.reminderTimeLocal?.trim()

  if ((pushEnabled || emailEnabled) && days.length === 0) {
    throw new AppError(ErrorCode.REMINDER_DAYS_REQUIRED, 400)
  }

  if (time !== undefined && !isValidReminderTime(time)) {
    throw new AppError(ErrorCode.INVALID_REMINDER_TIME, 400)
  }

  if (body.reminderDays !== undefined && normalizeReminderDays(body.reminderDays).length === 0) {
    if (pushEnabled || emailEnabled) {
      throw new AppError(ErrorCode.REMINDER_DAYS_REQUIRED, 400)
    }
  }

  return {
    days,
    time,
  }
}

export async function getWorkoutReminderSettings(
  userId: number,
): Promise<WorkoutReminderSettings> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: reminderUserSelect,
  })

  if (!user) {
    throw new AppError(ErrorCode.USER_NOT_FOUND, 404)
  }

  const workoutsLast7Days = await countWorkoutsLast7Days(userId)

  return mapReminderSettings(user, workoutsLast7Days)
}

export async function updateWorkoutReminderSettings(
  userId: number,
  body: UpdateWorkoutReminderBody,
): Promise<WorkoutReminderSettings> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: reminderUserSelect,
  })

  if (!existing) {
    throw new AppError(ErrorCode.USER_NOT_FOUND, 404)
  }

  const validated = validateReminderPayload({
    pushReminderEnabled: body.pushReminderEnabled ?? existing.pushReminderEnabled,
    emailReminderEnabled: body.emailReminderEnabled ?? existing.emailReminderEnabled,
    reminderDays: body.reminderDays ?? existing.reminderDays,
    reminderTimeLocal: body.reminderTimeLocal ?? existing.reminderTimeLocal,
    reminderTimezone: body.reminderTimezone ?? existing.reminderTimezone,
  })

  const pushReminderEnabled = body.pushReminderEnabled ?? existing.pushReminderEnabled
  const emailReminderEnabled = body.emailReminderEnabled ?? existing.emailReminderEnabled
  const reminderDays =
    body.reminderDays !== undefined ? validated.days : existing.reminderDays

  if ((pushReminderEnabled || emailReminderEnabled) && reminderDays.length === 0) {
    throw new AppError(ErrorCode.REMINDER_DAYS_REQUIRED, 400)
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      pushReminderEnabled,
      emailReminderEnabled,
      reminderDays,
      reminderTimeLocal: validated.time ?? existing.reminderTimeLocal,
      reminderTimezone: body.reminderTimezone?.trim() || existing.reminderTimezone,
    },
    select: reminderUserSelect,
  })

  const workoutsLast7Days = await countWorkoutsLast7Days(userId)

  return mapReminderSettings(updated, workoutsLast7Days)
}

export async function processEmailWorkoutReminders(
  now = new Date(),
): Promise<EmailReminderBatchResult> {
  const users = await prisma.user.findMany({
    where: {
      emailReminderEnabled: true,
      emailVerifiedAt: { not: null },
    },
    select: reminderUserSelect,
  })

  let sent = 0
  let skipped = 0

  for (const user of users) {
    if (
      !isReminderDay(user.reminderDays, user.reminderTimezone, now) ||
      !isReminderHour(user.reminderTimeLocal, user.reminderTimezone, now) ||
      wasEmailReminderSentToday(user.lastEmailReminderSentAt, user.reminderTimezone, now)
    ) {
      skipped += 1
      continue
    }

    const workoutsLast7Days = await countWorkoutsLast7Days(user.id)

    if (workoutsLast7Days > 0) {
      skipped += 1
      continue
    }

    const locale = parseAppLocale(user.locale)
    const appUrl = process.env.APP_URL ?? 'http://localhost:5173'

    await sendWorkoutReminderEmail(user.email, user.name, `${appUrl}/workouts`, locale)

    await prisma.user.update({
      where: { id: user.id },
      data: { lastEmailReminderSentAt: now },
    })

    sent += 1
  }

  return {
    processed: users.length,
    sent,
    skipped,
  }
}

export function shouldTriggerPushReminder(
  settings: WorkoutReminderSettings,
  now = new Date(),
): boolean {
  if (!settings.pushReminderEnabled || settings.reminderDays.length === 0) {
    return false
  }

  const local = getLocalTimeParts(settings.reminderTimezone, now)
  const [targetHour, targetMinute] = settings.reminderTimeLocal.split(':').map(Number)

  if (!settings.reminderDays.includes(local.weekdayIndex)) {
    return false
  }

  if (local.hour !== targetHour || local.minute < targetMinute) {
    return false
  }

  if (settings.workoutsLast7Days > 0) {
    return false
  }

  return true
}
