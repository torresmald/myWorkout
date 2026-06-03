import { describe, expect, it } from 'vitest'

import { ApiError } from '@/utils/api-error.util'
import {
  getErrorMessage,
  isApiErrorCode,
  translateErrorCode,
  translateMessageCode,
} from '@/utils/error.util'

describe('error.util', () => {
  it('traduce códigos de error conocidos', () => {
    const message = translateErrorCode('INVALID_CREDENTIALS')

    expect(message).toBeTruthy()
    expect(typeof message).toBe('string')
  })

  it('devuelve null para códigos desconocidos', () => {
    expect(translateErrorCode('NOT_A_REAL_CODE_XYZ')).toBeNull()
  })

  it('traduce códigos de mensaje conocidos', () => {
    expect(translateMessageCode('loginSuccess')).toBeTruthy()
  })

  it('devuelve el código literal si no hay traducción de mensaje', () => {
    expect(translateMessageCode('UNKNOWN_MESSAGE_CODE')).toBe('UNKNOWN_MESSAGE_CODE')
  })

  it('obtiene mensaje desde ApiError', () => {
    const message = getErrorMessage(new ApiError('INVALID_CREDENTIALS'), 'fallback')

    expect(message).not.toBe('fallback')
  })

  it('obtiene mensaje desde Error genérico', () => {
    expect(getErrorMessage(new Error('INVALID_CREDENTIALS'), 'fallback')).not.toBe('fallback')
    expect(getErrorMessage(new Error('random error'), 'fallback')).toBe('random error')
  })

  it('usa fallback para errores desconocidos', () => {
    expect(getErrorMessage('oops', 'fallback')).toBe('fallback')
  })

  it('detecta código ApiError', () => {
    expect(isApiErrorCode(new ApiError('INVALID_CREDENTIALS'), 'INVALID_CREDENTIALS')).toBe(true)
    expect(isApiErrorCode(new ApiError('OTHER'), 'INVALID_CREDENTIALS')).toBe(false)
  })

  it('detecta código en Error genérico', () => {
    expect(isApiErrorCode(new Error('INVALID_CREDENTIALS'), 'INVALID_CREDENTIALS')).toBe(true)
    expect(isApiErrorCode('x', 'INVALID_CREDENTIALS')).toBe(false)
  })
})
