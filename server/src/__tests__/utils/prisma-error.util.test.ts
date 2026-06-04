import { Prisma } from '@prisma/client'
import { describe, expect, it } from 'vitest'

import {
  isPrismaForeignKeyViolation,
  isPrismaUniqueViolation,
} from '../../utils/prisma-error.util.js'

function createPrismaError(code: string) {
  return new Prisma.PrismaClientKnownRequestError('Test error', {
    code,
    clientVersion: 'test',
  })
}

describe('prisma-error.util', () => {
  it('detecta violaciones de unicidad y FK', () => {
    expect(isPrismaUniqueViolation(createPrismaError('P2002'))).toBe(true)
    expect(isPrismaForeignKeyViolation(createPrismaError('P2003'))).toBe(true)
  })

  it('ignora otros errores', () => {
    expect(isPrismaUniqueViolation(new Error('fail'))).toBe(false)
    expect(isPrismaForeignKeyViolation(createPrismaError('P2025'))).toBe(false)
  })
})
