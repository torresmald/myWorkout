import { i18n } from '@/i18n'

function getDateLocale(): string {
  return i18n.global.locale.value === 'en' ? 'en-US' : 'es-ES'
}

export function isoToDateInputValue(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10)
}

export function todayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10)
}

export function dateInputToIso(date: string): string {
  return `${date}T12:00:00.000Z`
}

function toLocalDateKey(iso: string): string {
  const date = new Date(iso)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function todayLocalDateKey(): string {
  return toLocalDateKey(new Date().toISOString())
}

function yesterdayLocalDateKey(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return toLocalDateKey(yesterday.toISOString())
}

export function formatWorkoutDate(iso: string): string {
  return new Date(iso).toLocaleDateString(getDateLocale(), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatListDate(iso: string): string {
  const dateKey = toLocalDateKey(iso)

  if (dateKey === todayLocalDateKey()) {
    return i18n.global.t('common.dateToday')
  }

  if (dateKey === yesterdayLocalDateKey()) {
    return i18n.global.t('common.dateYesterday')
  }

  return formatWorkoutDate(iso)
}

export function formatWeekLabel(iso: string): string {
  return new Date(`${iso}T12:00:00.000Z`).toLocaleDateString(getDateLocale(), {
    day: 'numeric',
    month: 'short',
  })
}
