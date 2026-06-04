import { Decimal } from '@prisma/client/runtime/library'
import { describe, expect, it } from 'vitest'

import { decimalToNumber } from '../../utils/decimal.util.js'

describe('decimal.util', () => {
  it('convierte Decimal a number', () => {
    expect(decimalToNumber(new Decimal('78.50'))).toBe(78.5)
    expect(decimalToNumber(null)).toBeNull()
    expect(decimalToNumber(undefined)).toBeNull()
  })
})
