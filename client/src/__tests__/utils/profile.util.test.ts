import { describe, expect, it } from 'vitest'

import { MAX_AVATAR_SIZE_BYTES } from '@/interfaces/profile.interface'
import {
  getUserInitials,
  parseOptionalNumber,
  validateAvatarFile,
  withCacheBuster,
} from '@/utils/profile.util'

function createFile(type: string, size: number): File {
  const file = new File(['x'], 'avatar.png', { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('profile.util', () => {
  it('obtiene iniciales del nombre', () => {
    expect(getUserInitials('Jon Doe', 'jon@example.com')).toBe('JD')
  })

  it('usa la primera letra del email si no hay nombre', () => {
    expect(getUserInitials(null, 'jon@example.com')).toBe('J')
  })

  it('devuelve ? si no hay nombre ni email', () => {
    expect(getUserInitials(null, '')).toBe('?')
  })

  it('valida formato y tamaño del avatar', () => {
    expect(validateAvatarFile(createFile('image/png', 1024))).toBeNull()
    expect(validateAvatarFile(createFile('application/pdf', 1024))).toBe('invalidFormat')
    expect(validateAvatarFile(createFile('image/png', MAX_AVATAR_SIZE_BYTES + 1))).toBe(
      'tooLarge',
    )
  })

  it('añade cache buster a URL sin query', () => {
    expect(withCacheBuster('https://cdn.example.com/a.png', 42)).toBe(
      'https://cdn.example.com/a.png?v=42',
    )
  })

  it('añade cache buster a URL con query existente', () => {
    expect(withCacheBuster('https://cdn.example.com/a.png?foo=1', 42)).toBe(
      'https://cdn.example.com/a.png?foo=1&v=42',
    )
  })

  describe('parseOptionalNumber', () => {
    it('devuelve null para valores vacíos o no numéricos', () => {
      expect(parseOptionalNumber('')).toBeNull()
      expect(parseOptionalNumber(null)).toBeNull()
      expect(parseOptionalNumber(undefined)).toBeNull()
      expect(parseOptionalNumber('abc')).toBeNull()
    })

    it('parsea números desde string o number', () => {
      expect(parseOptionalNumber('72.5')).toBe(72.5)
      expect(parseOptionalNumber(80)).toBe(80)
    })
  })
})
