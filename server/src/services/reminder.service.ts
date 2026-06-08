import { ErrorCode } from '../constants/error-codes.constants.js'
import { prisma } from '../config/prisma.js'
import { userPreferencesReminderSelect } from '../constants/user-preferences.constants.js'
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
  hasPlannedWorkoutOnLocalDate,
  isReminderDay,
  isReminderHour,
  isValidReminderTime,
  normalizeReminderDays,
  wasEmailReminderSentToday,
} from '../utils/reminder.util.js'
import { sendPlannedWorkoutReminderEmail, sendWorkoutReminderEmail } from './mail.service.js'
import { ensureUserPreferences } from './user-preferences.service.js'

async function countWorkoutsLast7Days(userId: number): Promise<number> {
  return prisma.workout.count({
    where: {
      userId,
      date: { gte: getSevenDaysAgo() },
    },
  })
}

async function userHasPlannedWorkoutToday(
  userId: number,
  timezone: string,
  now = new Date(),
): Promise<boolean> {
  const { dateKey } = getLocalTimeParts(timezone, now)
  const plannedWorkouts = await prisma.workout.findMany({
    where: {
      userId,
      status: 'PLANNED',
    },
    select: { date: true },
  })

  return plannedWorkouts.some((workout) =>
    hasPlannedWorkoutOnLocalDate(workout.date, timezone, dateKey),
  )
}

function mapReminderSettings(
  preferences: {
    pushReminderEnabled: boolean
    emailReminderEnabled: boolean
    plannedWorkoutReminderEnabled: boolean
    reminderDays: number[]
    reminderTimeLocal: string
    reminderTimezone: string
  },
  workoutsLast7Days: number,
  hasPlannedWorkoutToday: boolean,
): WorkoutReminderSettings {
  return {
    pushReminderEnabled: preferences.pushReminderEnabled,
    emailReminderEnabled: preferences.emailReminderEnabled,
    plannedWorkoutReminderEnabled: preferences.plannedWorkoutReminderEnabled,
    reminderDays: preferences.reminderDays,
    reminderTimeLocal: preferences.reminderTimeLocal,
    reminderTimezone: preferences.reminderTimezone,
    workoutsLast7Days,
    hasPlannedWorkoutToday,
  }
}

function validateReminderPayload(body: UpdateWorkoutReminderBody) {
  const pushEnabled = body.pushReminderEnabled ?? false
  const emailEnabled = body.emailReminderEnabled ?? false
  const plannedEnabled = body.plannedWorkoutReminderEnabled ?? false
  const days = body.reminderDays !== undefined ? normalizeReminderDays(body.reminderDays) : []
  const time = body.reminderTimeLocal?.trim()

  if ((pushEnabled || emailEnabled || plannedEnabled) && days.length === 0) {
    throw new AppError(ErrorCode.REMINDER_DAYS_REQUIRED, 400)
  }

  if (time !== undefined && !isValidReminderTime(time)) {
    throw new AppError(ErrorCode.INVALID_REMINDER_TIME, 400)
  }

  if (body.reminderDays !== undefined && normalizeReminderDays(body.reminderDays).length === 0) {
    if (pushEnabled || emailEnabled || plannedEnabled) {
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
  await ensureUserPreferences(userId)

  const preferences = await prisma.userPreferences.findUnique({
    where: { userId },
    select: userPreferencesReminderSelect,
  })

  if (!preferences) {
    throw new AppError(ErrorCode.USER_NOT_FOUND, 404)
  }

  const workoutsLast7Days = await countWorkoutsLast7Days(userId)
  const hasPlannedWorkoutToday = await userHasPlannedWorkoutToday(
    userId,
    preferences.reminderTimezone,
  )

  return mapReminderSettings(preferences, workoutsLast7Days, hasPlannedWorkoutToday)
}

export async function updateWorkoutReminderSettings(
  userId: number,
  body: UpdateWorkoutReminderBody,
): Promise<WorkoutReminderSettings> {
  const existing = await ensureUserPreferences(userId)

  const validated = validateReminderPayload({
    pushReminderEnabled: body.pushReminderEnabled ?? existing.pushReminderEnabled,
    emailReminderEnabled: body.emailReminderEnabled ?? existing.emailReminderEnabled,
    plannedWorkoutReminderEnabled:
      body.plannedWorkoutReminderEnabled ?? existing.plannedWorkoutReminderEnabled,
    reminderDays: body.reminderDays ?? existing.reminderDays,
    reminderTimeLocal: body.reminderTimeLocal ?? existing.reminderTimeLocal,
    reminderTimezone: body.reminderTimezone ?? existing.reminderTimezone,
  })

  const pushReminderEnabled = body.pushReminderEnabled ?? existing.pushReminderEnabled
  const emailReminderEnabled = body.emailReminderEnabled ?? existing.emailReminderEnabled
  const plannedWorkoutReminderEnabled =
    body.plannedWorkoutReminderEnabled ?? existing.plannedWorkoutReminderEnabled
  const reminderDays =
    body.reminderDays !== undefined ? validated.days : existing.reminderDays

  if (
    (pushReminderEnabled || emailReminderEnabled || plannedWorkoutReminderEnabled) &&
    reminderDays.length === 0
  ) {
    throw new AppError(ErrorCode.REMINDER_DAYS_REQUIRED, 400)
  }

  const updated = await prisma.userPreferences.update({
    where: { userId },
    data: {
      pushReminderEnabled,
      emailReminderEnabled,
      plannedWorkoutReminderEnabled,
      reminderDays,
      reminderTimeLocal: validated.time ?? existing.reminderTimeLocal,
      reminderTimezone: body.reminderTimezone?.trim() || existing.reminderTimezone,
    },
    select: userPreferencesReminderSelect,
  })

  const workoutsLast7Days = await countWorkoutsLast7Days(userId)
  const hasPlannedWorkoutToday = await userHasPlannedWorkoutToday(
    userId,
    updated.reminderTimezone,
  )

  return mapReminderSettings(updated, workoutsLast7Days, hasPlannedWorkoutToday)
}

export async function processEmailWorkoutReminders(
  now = new Date(),
): Promise<EmailReminderBatchResult> {
  const users = await prisma.user.findMany({
    where: {
      emailVerifiedAt: { not: null },
      preferences: {
        OR: [{ emailReminderEnabled: true }, { plannedWorkoutReminderEnabled: true }],
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      preferences: {
        select: userPreferencesReminderSelect,
      },
    },
  })

  let sent = 0
  let skipped = 0

  for (const user of users) {
    const preferences = user.preferences

    if (!preferences) {
      skipped += 1
      continue
    }

    const onSchedule =
      isReminderDay(preferences.reminderDays, preferences.reminderTimezone, now) &&
      isReminderHour(preferences.reminderTimeLocal, preferences.reminderTimezone, now)

    if (!onSchedule) {
      skipped += 1
      continue
    }

    const locale = parseAppLocale(preferences.locale)
    const appUrl = process.env.APP_URL ?? 'http://localhost:5173'
    let sentForUser = 0

    if (
      preferences.plannedWorkoutReminderEnabled &&
      !wasEmailReminderSentToday(
        preferences.lastPlannedEmailReminderSentAt,
        preferences.reminderTimezone,
        now,
      )
    ) {
      const hasPlannedToday = await userHasPlannedWorkoutToday(
        user.id,
        preferences.reminderTimezone,
        now,
      )

      if (hasPlannedToday) {
        await sendPlannedWorkoutReminderEmail(user.email, user.name, `${appUrl}/workouts`, locale)

        await prisma.userPreferences.update({
          where: { userId: user.id },
          data: { lastPlannedEmailReminderSentAt: now },
        })

        sentForUser += 1
      }
    }

    if (
      preferences.emailReminderEnabled &&
      !wasEmailReminderSentToday(
        preferences.lastEmailReminderSentAt,
        preferences.reminderTimezone,
        now,
      )
    ) {
      const workoutsLast7Days = await countWorkoutsLast7Days(user.id)

      if (workoutsLast7Days === 0) {
        await sendWorkoutReminderEmail(user.email, user.name, `${appUrl}/workouts`, locale)

        await prisma.userPreferences.update({
          where: { userId: user.id },
          data: { lastEmailReminderSentAt: now },
        })

        sentForUser += 1
      }
    }

    sent += sentForUser

    if (sentForUser === 0) {
      skipped += 1
    }
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

export function shouldTriggerPlannedWorkoutPushReminder(
  settings: WorkoutReminderSettings,
  now = new Date(),
): boolean {
  if (!settings.plannedWorkoutReminderEnabled || settings.reminderDays.length === 0) {
    return false
  }

  if (!settings.hasPlannedWorkoutToday) {
    return false
  }

  const local = getLocalTimeParts(settings.reminderTimezone, now)
  const [targetHour, targetMinute] = settings.reminderTimeLocal.split(':').map(Number)

  if (!settings.reminderDays.includes(local.weekdayIndex)) {
    return false
  }

  return local.hour === targetHour && local.minute >= targetMinute
}
