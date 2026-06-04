import { describe, expect, it, vi } from 'vitest'

import { ErrorCode } from '../../constants/error-codes.constants.js'
import { AppError } from '../../interfaces/app-error.interface.js'
import { handleServiceError } from '../../utils/app-error.util.js'

describe('app-error.util', () => {
  it('responde AppError y devuelve true', () => {
    const json = vi.fn()
    const status = vi.fn().mockReturnValue({ json })
    const error = new AppError(ErrorCode.NAME_REQUIRED, 400, { field: 'name' })

    const handled = handleServiceError(error, { status } as never)

    expect(handled).toBe(true)
    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        error: ErrorCode.NAME_REQUIRED,
        errorParams: { field: 'name' },
      }),
    )
  })

  it('ignora errores no controlados', () => {
    expect(handleServiceError(new Error('boom'), { status: vi.fn() } as never)).toBe(false)
  })
})
