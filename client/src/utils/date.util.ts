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

export function formatWorkoutDate(iso: string): string {
  return new Date(iso).toLocaleDateString(getDateLocale(), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatWeekLabel(iso: string): string {
  return new Date(`${iso}T12:00:00.000Z`).toLocaleDateString(getDateLocale(), {
    day: 'numeric',
    month: 'short',
  })
}
