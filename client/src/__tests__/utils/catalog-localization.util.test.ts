import { describe, expect, it } from 'vitest'

import { createCatalogExercise } from '@/__tests__/fixtures/catalog-exercise.fixture'
import { getCatalogDescription, getCatalogName } from '@/utils/catalog-localization.util'

describe('catalog-localization.util', () => {
  it('devuelve nombre y descripción en español cuando el locale es es', () => {
    const exercise = createCatalogExercise()

    expect(getCatalogName(exercise, 'es')).toBe('Press de banca')
    expect(getCatalogDescription(exercise, 'es')).toBe('Baja la barra al pecho y empuja hacia arriba.')
  })

  it('devuelve nombre y descripción en inglés cuando el locale es en', () => {
    const exercise = createCatalogExercise()

    expect(getCatalogName(exercise, 'en')).toBe('Bench press')
    expect(getCatalogDescription(exercise, 'en')).toBe('Lower the bar to your chest and press up.')
  })

  it('cambia el texto mostrado al alternar locale sin modificar los datos del ejercicio', () => {
    const exercise = createCatalogExercise()

    expect(getCatalogDescription(exercise, 'es')).toBe('Baja la barra al pecho y empuja hacia arriba.')
    expect(getCatalogDescription(exercise, 'en')).toBe('Lower the bar to your chest and press up.')
    expect(exercise.descriptionEs).toBe('Baja la barra al pecho y empuja hacia arriba.')
    expect(exercise.descriptionEn).toBe('Lower the bar to your chest and press up.')
  })
})
