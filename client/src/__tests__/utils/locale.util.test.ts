import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LOCALE_STORAGE_KEY } from '@/constants/locale.constants'
import { i18n } from '@/i18n'
import {
  applyDocumentLocale,
  applyLocale,
  getInitialLocale,
  getStoredLocale,
  isAppLocale,
} from '@/utils/locale.util'

describe('locale.util', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.lang = 'es'
    i18n.global.locale.value = 'es'
  })

  it('valida locales soportados', () => {
    expect(isAppLocale('es')).toBe(true)
    expect(isAppLocale('en')).toBe(true)
    expect(isAppLocale('fr')).toBe(false)
  })

  it('lee locale almacenado válido', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'en')

    expect(getStoredLocale()).toBe('en')
  })

  it('devuelve null cuando el valor almacenado no es válido', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'fr')

    expect(getStoredLocale()).toBeNull()
  })

  it('aplica locale a i18n, localStorage y documento', () => {
    applyLocale('en')

    expect(i18n.global.locale.value).toBe('en')
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en')
    expect(document.documentElement.lang).toBe('en')
  })

  it('aplica locale al documento directamente', () => {
    applyDocumentLocale('en')

    expect(document.documentElement.lang).toBe('en')
  })

  it('usa locale almacenado como inicial', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'en')

    expect(getInitialLocale()).toBe('en')
  })

  it('detecta inglés del navegador', () => {
    vi.stubGlobal('navigator', {
      language: 'en-US',
      languages: ['en-US'],
    })

    expect(getInitialLocale()).toBe('en')
  })

  it('detecta español del navegador', () => {
    vi.stubGlobal('navigator', {
      language: 'es-ES',
      languages: ['es-ES'],
    })

    expect(getInitialLocale()).toBe('es')
  })

  it('usa locale por defecto si el navegador no coincide', () => {
    vi.stubGlobal('navigator', {
      language: 'fr-FR',
      languages: ['fr-FR'],
    })

    expect(getInitialLocale()).toBe('es')
  })
})
