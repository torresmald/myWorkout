const PUSH_REMINDER_STORAGE_PREFIX = 'myworkout_push_reminder_'
const PLANNED_PUSH_REMINDER_STORAGE_PREFIX = 'myworkout_push_planned_reminder_'

export function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

export function getPushReminderStorageKey(dateKey: string): string {
  return `${PUSH_REMINDER_STORAGE_PREFIX}${dateKey}`
}

export function wasPushReminderShownToday(dateKey: string): boolean {
  return localStorage.getItem(getPushReminderStorageKey(dateKey)) === '1'
}

export function markPushReminderShownToday(dateKey: string) {
  localStorage.setItem(getPushReminderStorageKey(dateKey), '1')
}

function getPlannedPushReminderStorageKey(dateKey: string): string {
  return `${PLANNED_PUSH_REMINDER_STORAGE_PREFIX}${dateKey}`
}

export function wasPlannedPushReminderShownToday(dateKey: string): boolean {
  return localStorage.getItem(getPlannedPushReminderStorageKey(dateKey)) === '1'
}

export function markPlannedPushReminderShownToday(dateKey: string) {
  localStorage.setItem(getPlannedPushReminderStorageKey(dateKey), '1')
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) {
    return 'unsupported'
  }

  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission
  }

  return Notification.requestPermission()
}

export function showWorkoutReminderNotification(title: string, body: string, targetUrl: string) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return
  }

  const notification = new Notification(title, {
    body,
    icon: '/pwa-192x192.png',
    tag: 'workout-reminder',
  })

  notification.onclick = () => {
    window.focus()
    window.location.assign(targetUrl)
    notification.close()
  }
}

export function getLocalDateKey(timezone: string, date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  return formatter.format(date)
}

export function getLocalWeekdayIndex(timezone: string, date = new Date()): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
  })
  const weekday = formatter.format(date)
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }

  return map[weekday] ?? 0
}

export function getLocalHourMinute(timezone: string, date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = formatter.formatToParts(date)
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]))

  return {
    hour: Number(lookup.hour ?? 0),
    minute: Number(lookup.minute ?? 0),
  }
}

export function shouldShowPushReminder(
  settings: {
    pushReminderEnabled: boolean
    reminderDays: number[]
    reminderTimeLocal: string
    reminderTimezone: string
    workoutsLast7Days: number
  },
  now = new Date(),
): boolean {
  if (!settings.pushReminderEnabled || settings.workoutsLast7Days > 0) {
    return false
  }

  const weekday = getLocalWeekdayIndex(settings.reminderTimezone, now)

  if (!settings.reminderDays.includes(weekday)) {
    return false
  }

  const [targetHour = 0, targetMinute = 0] = settings.reminderTimeLocal.split(':').map(Number)
  const { hour, minute } = getLocalHourMinute(settings.reminderTimezone, now)

  if (hour !== targetHour || minute < targetMinute) {
    return false
  }

  const dateKey = getLocalDateKey(settings.reminderTimezone, now)

  return !wasPushReminderShownToday(dateKey)
}

export function shouldShowPlannedWorkoutPushReminder(
  settings: {
    plannedWorkoutReminderEnabled: boolean
    reminderDays: number[]
    reminderTimeLocal: string
    reminderTimezone: string
    hasPlannedWorkoutToday: boolean
  },
  now = new Date(),
): boolean {
  if (!settings.plannedWorkoutReminderEnabled || !settings.hasPlannedWorkoutToday) {
    return false
  }

  const weekday = getLocalWeekdayIndex(settings.reminderTimezone, now)

  if (!settings.reminderDays.includes(weekday)) {
    return false
  }

  const [targetHour = 0, targetMinute = 0] = settings.reminderTimeLocal.split(':').map(Number)
  const { hour, minute } = getLocalHourMinute(settings.reminderTimezone, now)

  if (hour !== targetHour || minute < targetMinute) {
    return false
  }

  const dateKey = getLocalDateKey(settings.reminderTimezone, now)

  return !wasPlannedPushReminderShownToday(dateKey)
}
