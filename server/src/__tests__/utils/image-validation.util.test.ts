import { describe, expect, it } from 'vitest'

import { ErrorCode } from '../../constants/error-codes.constants.js'
import { MINIMAL_PNG_BUFFER } from '../fixtures/test-image.fixture.js'
import {
  detectImageKind,
  getImageExtension,
  validateUploadedImage,
} from '../../utils/image-validation.util.js'

describe('image-validation.util', () => {
  it('detecta tipo de imagen por magic bytes', () => {
    expect(detectImageKind(MINIMAL_PNG_BUFFER)).toBe('png')
    expect(detectImageKind(Buffer.from([0xff, 0xd8, 0xff, 0x00]))).toBe('jpeg')
    expect(detectImageKind(Buffer.from('invalid'))).toBeNull()
  })

  it('valida coherencia entre buffer y mime type', () => {
    expect(validateUploadedImage(MINIMAL_PNG_BUFFER, 'image/png')).toBe('png')
    expect(getImageExtension('png')).toBe('png')

    expect(() => validateUploadedImage(MINIMAL_PNG_BUFFER, 'image/jpeg')).toThrow(
      expect.objectContaining({ code: ErrorCode.IMAGE_MIME_MISMATCH }),
    )
  })
})
