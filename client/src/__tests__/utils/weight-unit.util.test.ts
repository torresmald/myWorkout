import { describe, expect, it } from 'vitest'

import {
  convertWeightFromKg,
  convertWeightToKg,
  formatWeightValue,
  getWeightInputBounds,
  isValidDisplayWeight,
  kgToLb,
  lbToKg,
} from '@/utils/weight-unit.util'

describe('weight-unit.util', () => {
  it('convierte kg a lb y viceversa', () => {
    expect(kgToLb(80)).toBe(176.4)
    expect(lbToKg(176.4)).toBeCloseTo(80, 1)
  })

  it('formatea peso con unidad', () => {
    expect(formatWeightValue(75, 'kg')).toBe('75 kg')
    expect(formatWeightValue(75, 'lb')).toBe('165.3 lb')
  })

  it('valida rangos en la unidad de visualización', () => {
    expect(isValidDisplayWeight(75, 'kg')).toBe(true)
    expect(isValidDisplayWeight(165.3, 'lb')).toBe(true)
    expect(isValidDisplayWeight(10, 'kg')).toBe(false)
  })

  it('devuelve límites de input según unidad', () => {
    expect(getWeightInputBounds('kg')).toEqual({ min: 20, max: 500, step: 0.1 })
    expect(getWeightInputBounds('lb').min).toBeGreaterThan(40)
  })

  it('convierte valores de visualización a kg', () => {
    expect(convertWeightToKg(165.3, 'lb')).toBeCloseTo(75, 0)
    expect(convertWeightFromKg(80, 'lb')).toBe(176.4)
  })
})
