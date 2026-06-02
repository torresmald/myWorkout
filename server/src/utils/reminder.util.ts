const REMINDER_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/
const MS_PER_DAY = 24 * 60 * 60 * 1000

const WEEKDAY_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

export function isValidReminderTime(value: string): boolean {
  return REMINDER_TIME_PATTERN.test(value.trim())
}

export function normalizeReminderDays(days: number[]): number[] {
  return [...new Set(days.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6))].sort(
    (a, b) => a - b,
  )
}

export function getLocalTimeParts(timezone: string, date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const parts = formatter.formatToParts(date)
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]))

  return {
    weekdayIndex: WEEKDAY_TO_INDEX[lookup.weekday ?? 'Sun'] ?? 0,
    hour: Number(lookup.hour ?? 0),
    minute: Number(lookup.minute ?? 0),
    dateKey: `${lookup.year}-${lookup.month}-${lookup.day}`,
  }
}

export function isReminderDay(reminderDays: number[], timezone: string, date = new Date()): boolean {
  const { weekdayIndex } = getLocalTimeParts(timezone, date)
  return reminderDays.includes(weekdayIndex)
}

export function isReminderHour(
  reminderTimeLocal: string,
  timezone: string,
  date = new Date(),
): boolean {
  const [targetHour] = reminderTimeLocal.split(':').map(Number)
  const { hour } = getLocalTimeParts(timezone, date)

  return hour === targetHour
}

export function getSevenDaysAgo(date = new Date()): Date {
  return new Date(date.getTime() - 7 * MS_PER_DAY)
}

export function wasEmailReminderSentToday(
  lastEmailReminderSentAt: Date | null,
  timezone: string,
  date = new Date(),
): boolean {
  if (!lastEmailReminderSentAt) {
    return false
  }

  const todayKey = getLocalTimeParts(timezone, date).dateKey
  const sentKey = getLocalTimeParts(timezone, lastEmailReminderSentAt).dateKey

  return todayKey === sentKey
}
