import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('google-auth.util', () => {
  beforeEach(() => {
    vi.resetModules()
    document.head.innerHTML = ''
    vi.unstubAllEnvs()
    delete (window as Window & { google?: unknown }).google
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  async function loadUtil() {
    return import('@/utils/google-auth.util')
  }

  it('resuelve de inmediato si Google ya está cargado', async () => {
    window.google = { accounts: { id: {} } } as never
    const { loadGoogleIdentityScript } = await loadUtil()

    await expect(loadGoogleIdentityScript()).resolves.toBeUndefined()
  })

  it('carga el script de Google cuando no está presente', async () => {
    const { loadGoogleIdentityScript } = await loadUtil()
    const promise = loadGoogleIdentityScript()
    const script = document.querySelector('script[src*="accounts.google.com"]') as HTMLScriptElement

    expect(script).toBeTruthy()
    script.onload?.(new Event('load'))

    await expect(promise).resolves.toBeUndefined()
  })

  it('rechaza si el script falla al cargar', async () => {
    const { loadGoogleIdentityScript } = await loadUtil()
    const promise = loadGoogleIdentityScript()
    const script = document.querySelector('script[src*="accounts.google.com"]') as HTMLScriptElement

    script.onerror?.(new Event('error'))

    await expect(promise).rejects.toThrow('No se pudo cargar Google Sign-In')
  })

  it('reutiliza la promesa de carga en llamadas concurrentes', async () => {
    const { loadGoogleIdentityScript } = await loadUtil()
    const first = loadGoogleIdentityScript()
    const second = loadGoogleIdentityScript()
    const script = document.querySelector('script[src*="accounts.google.com"]') as HTMLScriptElement

    script.onload?.(new Event('load'))

    await Promise.all([first, second])
    expect(document.querySelectorAll('script[src*="accounts.google.com"]').length).toBe(1)
  })

  it('detecta client id configurado', async () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'google-client-id')
    const { getGoogleClientId, isGoogleAuthConfigured } = await loadUtil()

    expect(getGoogleClientId()).toBe('google-client-id')
    expect(isGoogleAuthConfigured()).toBe(true)
  })

  it('devuelve undefined si no hay client id', async () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '')
    const { getGoogleClientId, isGoogleAuthConfigured } = await loadUtil()

    expect(getGoogleClientId()).toBeUndefined()
    expect(isGoogleAuthConfigured()).toBe(false)
  })
})
