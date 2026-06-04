import { describe, expect, it } from 'vitest'

import { parseAppLocale } from '../../utils/locale.util.js'

describe('locale.util', () => {
  it('parsea locales soportados', () => {
    expect(parseAppLocale('es')).toBe('es')
    expect(parseAppLocale('en')).toBe('en')
    expect(parseAppLocale('ES-es')).toBe('es')
    expect(parseAppLocale('en-US')).toBe('en')
  })

  it('usa locale por defecto para valores inválidos', () => {
    expect(parseAppLocale(undefined)).toBe('es')
    expect(parseAppLocale('fr')).toBe('es')
    expect(parseAppLocale('  ')).toBe('es')
  })
})
