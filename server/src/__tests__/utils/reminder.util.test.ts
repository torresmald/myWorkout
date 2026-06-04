import { describe, expect, it } from 'vitest'

import {
  getSevenDaysAgo,
  isReminderDay,
  isReminderHour,
  isValidReminderTime,
  normalizeReminderDays,
  wasEmailReminderSentToday,
} from '../../utils/reminder.util.js'

describe('reminder.util', () => {
  it('valida y normaliza configuración de recordatorio', () => {
    expect(isValidReminderTime('08:30')).toBe(true)
    expect(isValidReminderTime('25:00')).toBe(false)
    expect(normalizeReminderDays([3, 1, 1, 9, -1])).toEqual([1, 3])
  })

  it('evalúa día y hora local del recordatorio', () => {
    const mondayAtNine = new Date('2026-06-01T07:00:00.000Z')

    expect(isReminderDay([1], 'Europe/Madrid', mondayAtNine)).toBe(true)
    expect(isReminderHour('09:00', 'Europe/Madrid', mondayAtNine)).toBe(true)
    expect(isReminderHour('10:00', 'Europe/Madrid', mondayAtNine)).toBe(false)
  })

  it('calcula ventana de siete días y envíos diarios', () => {
    const now = new Date('2026-06-01T10:00:00.000Z')
    const sevenDaysAgo = getSevenDaysAgo(now)

    expect(now.getTime() - sevenDaysAgo.getTime()).toBe(7 * 24 * 60 * 60 * 1000)
    expect(wasEmailReminderSentToday(null, 'UTC', now)).toBe(false)
    expect(wasEmailReminderSentToday(now, 'UTC', now)).toBe(true)
  })
})
