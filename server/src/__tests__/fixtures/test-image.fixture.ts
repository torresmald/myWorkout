/** PNG 1×1 px válido para tests de upload. */
export const MINIMAL_PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

export const INVALID_IMAGE_BUFFER = Buffer.from('not-an-image', 'utf8')
