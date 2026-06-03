import { describe, expect, it } from 'vitest'

import {
  createApiError,
  createApiSuccess,
} from '@/__tests__/helpers/api-response.fixture'
import { ApiError, throwIfApiError } from '@/utils/api-error.util'

describe('ApiError', () => {
  it('expone código y parámetros del error de API', () => {
    const error = new ApiError('INVALID_CREDENTIALS', { field: 'email' })

    expect(error).toBeInstanceOf(Error)
    expect(error.code).toBe('INVALID_CREDENTIALS')
    expect(error.params).toEqual({ field: 'email' })
    expect(error.message).toBe('INVALID_CREDENTIALS')
  })
})

describe('throwIfApiError', () => {
  it('no lanza cuando la respuesta es exitosa', () => {
    expect(() =>
      throwIfApiError(createApiSuccess({ id: 1 }), 200),
    ).not.toThrow()
  })

  it('lanza ApiError cuando el status HTTP es 4xx', () => {
    expect(() =>
      throwIfApiError(createApiSuccess(null), 401),
    ).toThrow(ApiError)
  })

  it('lanza ApiError con código y params del body', () => {
    try {
      throwIfApiError(
        createApiError('VALIDATION_ERROR', { field: 'name' }),
        200,
      )
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect((error as ApiError).code).toBe('VALIDATION_ERROR')
      expect((error as ApiError).params).toEqual({ field: 'name' })
    }
  })

  it('usa UNKNOWN_ERROR cuando el body no incluye código', () => {
    try {
      throwIfApiError({ status: 'error', data: null, error: null }, 500)
    } catch (error) {
      expect((error as ApiError).code).toBe('UNKNOWN_ERROR')
    }
  })
})
