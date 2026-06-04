import { beforeEach, describe, expect, it } from 'vitest'

import { i18n } from '@/i18n'
import {
  dateInputToIso,
  formatWeekLabel,
  formatWorkoutDate,
  isoToDateInputValue,
  todayDateInputValue,
} from '@/utils/date.util'

describe('date.util', () => {
  beforeEach(() => {
    i18n.global.locale.value = 'es'
  })

  it('convierte ISO a valor de input date', () => {
    expect(isoToDateInputValue('2026-05-30T10:00:00.000Z')).toBe('2026-05-30')
  })

  it('devuelve la fecha de hoy en formato input', () => {
    expect(todayDateInputValue()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('convierte input date a ISO al mediodía UTC', () => {
    expect(dateInputToIso('2026-05-30')).toBe('2026-05-30T12:00:00.000Z')
  })

  it('formatea fecha de entrenamiento según locale ES', () => {
    const formatted = formatWorkoutDate('2026-05-30T12:00:00.000Z')

    expect(formatted).toContain('2026')
    expect(formatted.length).toBeGreaterThan(5)
  })

  it('formatea fecha de entrenamiento según locale EN', () => {
    i18n.global.locale.value = 'en'

    const formatted = formatWorkoutDate('2026-05-30T12:00:00.000Z')

    expect(formatted).toContain('2026')
  })

  it('formatea etiqueta de semana sin año', () => {
    const formatted = formatWeekLabel('2026-05-30')

    expect(formatted.length).toBeGreaterThan(2)
    expect(formatted).not.toContain('2026')
  })
})
