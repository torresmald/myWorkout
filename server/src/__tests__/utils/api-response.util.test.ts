import { describe, expect, it, vi } from 'vitest'

import {
  errorResponse,
  sendError,
  sendSuccess,
  successResponse,
} from '../../utils/api-response.util.js'

describe('api-response.util', () => {
  it('construye respuesta de éxito', () => {
    expect(successResponse({ id: 1 })).toEqual({
      status: 'success',
      data: { id: 1 },
      error: null,
      errorParams: null,
    })
  })

  it('construye respuesta de error', () => {
    expect(errorResponse('VALIDATION_ERROR', { field: 'email' })).toEqual({
      status: 'error',
      data: null,
      error: 'VALIDATION_ERROR',
      errorParams: { field: 'email' },
    })
  })

  it('envía JSON de éxito con status code', () => {
    const json = vi.fn()
    const status = vi.fn().mockReturnValue({ json })

    sendSuccess({ status } as never, { ok: true }, 201)

    expect(status).toHaveBeenCalledWith(201)
    expect(json).toHaveBeenCalledWith(successResponse({ ok: true }))
  })

  it('envía JSON de error con status code', () => {
    const json = vi.fn()
    const status = vi.fn().mockReturnValue({ json })

    sendError({ status } as never, 'NOT_FOUND', 404)

    expect(status).toHaveBeenCalledWith(404)
    expect(json).toHaveBeenCalledWith(errorResponse('NOT_FOUND'))
  })
})
