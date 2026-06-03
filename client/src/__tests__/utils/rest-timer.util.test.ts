import { describe, expect, it } from 'vitest'

import { formatCountdown } from '@/utils/rest-timer.util'

describe('formatCountdown', () => {
  it('formatea segundos con cero a la izquierda', () => {
    expect(formatCountdown(65)).toBe('1:05')
  })

  it('formatea cero segundos', () => {
    expect(formatCountdown(0)).toBe('0:00')
  })

  it('formatea minutos exactos', () => {
    expect(formatCountdown(120)).toBe('2:00')
  })
})
