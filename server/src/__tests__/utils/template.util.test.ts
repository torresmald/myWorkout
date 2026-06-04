import { describe, expect, it } from 'vitest'

import { parseTemplateExerciseId, parseTemplateId } from '../../utils/template.util.js'
import { parseExerciseTypeId } from '../../utils/exercise-type.util.js'

describe('template.util', () => {
  it('parsea ids de plantilla', () => {
    expect(parseTemplateId('4')).toBe(4)
    expect(parseTemplateId('abc')).toBeNull()
    expect(parseTemplateExerciseId('9')).toBe(9)
    expect(parseTemplateExerciseId('0')).toBeNull()
  })
})

describe('exercise-type.util', () => {
  it('parsea ids de tipo de ejercicio', () => {
    expect(parseExerciseTypeId('12')).toBe(12)
    expect(parseExerciseTypeId('-3')).toBeNull()
  })
})
