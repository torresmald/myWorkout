import { beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n, setTheme } from '@/i18n'

describe('i18n', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = ''
  })

  it('exporta instancia i18n con locale inicial', () => {
    expect(i18n.global.locale.value).toBeTruthy()
    expect(i18n.global.messages.value.es).toBeTruthy()
    expect(i18n.global.messages.value.en).toBeTruthy()
  })

  it('setTheme activa modo oscuro cuando está almacenado', () => {
    localStorage.setItem('myworkout_theme', 'dark')

    setTheme()

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('setTheme activa modo oscuro según preferencia del sistema', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
      }),
    )

    setTheme()

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('setTheme no activa modo oscuro con tema claro almacenado', () => {
    localStorage.setItem('myworkout_theme', 'light')
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
      }),
    )

    setTheme()

    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe('')
  })
})
