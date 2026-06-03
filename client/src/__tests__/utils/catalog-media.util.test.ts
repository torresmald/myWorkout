import { describe, expect, it } from 'vitest'

import {
  ALLOWED_CATALOG_MEDIA_MIME_TYPES,
  getCatalogMediaAcceptAttribute,
  validateCatalogMediaFile,
} from '@/utils/catalog-media.util'

function createFile(type: string, size: number): File {
  const file = new File(['x'], 'media.bin', { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('catalog-media.util', () => {
  it('acepta tipos MIME permitidos', () => {
    for (const type of ALLOWED_CATALOG_MEDIA_MIME_TYPES) {
      expect(validateCatalogMediaFile(createFile(type, 1024))).toBeNull()
    }
  })

  it('rechaza formatos no permitidos', () => {
    expect(validateCatalogMediaFile(createFile('application/pdf', 1024))).toBe('invalidFormat')
  })

  it('rechaza archivos demasiado grandes', () => {
    expect(
      validateCatalogMediaFile(createFile('image/jpeg', 16 * 1024 * 1024)),
    ).toBe('tooLarge')
  })

  it('genera atributo accept con todos los MIME', () => {
    expect(getCatalogMediaAcceptAttribute()).toBe(ALLOWED_CATALOG_MEDIA_MIME_TYPES.join(','))
  })
})
