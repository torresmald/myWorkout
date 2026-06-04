import { describe, expect, it } from 'vitest'

import { BmiCategoryCode } from '../../constants/error-codes.constants.js'
import { calculateBmi } from '../../utils/bmi.util.js'

describe('bmi.util', () => {
  it('devuelve null si faltan peso o altura', () => {
    expect(calculateBmi(null, 180)).toEqual({ bmi: null, bmiCategory: null })
    expect(calculateBmi(80, null)).toEqual({ bmi: null, bmiCategory: null })
    expect(calculateBmi(80, 0)).toEqual({ bmi: null, bmiCategory: null })
  })

  it('calcula IMC y categoría', () => {
    expect(calculateBmi(70, 175)).toEqual({
      bmi: 22.9,
      bmiCategory: BmiCategoryCode.NORMAL,
    })

    expect(calculateBmi(50, 180).bmiCategory).toBe(BmiCategoryCode.UNDERWEIGHT)
    expect(calculateBmi(85, 170).bmiCategory).toBe(BmiCategoryCode.OVERWEIGHT)
    expect(calculateBmi(100, 170).bmiCategory).toBe(BmiCategoryCode.OBESITY)
  })
})
