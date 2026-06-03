import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton.vue'
import { COOKIE_CONSENT_STORAGE_KEY } from '@/constants/cookie.constants'
import { i18n } from '@/i18n'
import { useCookieConsentStore } from '@/stores/cookie-consent.store'
import * as googleAuthUtil from '@/utils/google-auth.util'

vi.mock('@/utils/google-auth.util', () => ({
  getGoogleClientId: vi.fn(),
  loadGoogleIdentityScript: vi.fn(),
}))

const mockRenderButton = vi.fn()
const mockInitialize = vi.fn()

function setupGoogleMock() {
  window.google = {
    accounts: {
      id: {
        initialize: mockInitialize,
        renderButton: mockRenderButton,
      },
    },
  } as typeof window.google
}

function enableThirdPartyConsent() {
  localStorage.setItem(
    COOKIE_CONSENT_STORAGE_KEY,
    JSON.stringify({ analytics: false, thirdParty: true, updatedAt: new Date().toISOString() }),
  )
}

describe('GoogleSignInButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    delete (window as { google?: unknown }).google
    vi.mocked(googleAuthUtil.getGoogleClientId).mockReturnValue('test-client-id')
    vi.mocked(googleAuthUtil.loadGoogleIdentityScript).mockResolvedValue(undefined)
    setupGoogleMock()
  })

  it('no renderiza nada si Google no está configurado', async () => {
    vi.mocked(googleAuthUtil.getGoogleClientId).mockReturnValue(undefined)

    const { wrapper } = await mountWithPlugins(GoogleSignInButton, {})

    expect(wrapper.text()).toBe('')
  })

  it('muestra aviso de consentimiento cuando faltan cookies de terceros', async () => {
    const { wrapper } = await mountWithPlugins(GoogleSignInButton, {})

    expect(wrapper.text()).toContain(i18n.global.t('cookies.google.consentRequired'))
  })

  it('habilita cookies de terceros al pulsar el botón correspondiente', async () => {
    const { pinia, wrapper } = await mountWithPlugins(GoogleSignInButton, {})

    const enableLabel = i18n.global.t('cookies.google.enableThirdParty')
    const enableButton = wrapper.findAll('button').find((btn) => btn.text().includes(enableLabel))
    await enableButton!.trigger('click')
    await flushPromises()

    const store = useCookieConsentStore(pinia)
    expect(store.preferences.thirdParty).toBe(true)
  })

  it('inicializa el botón de Google con consentimiento de terceros', async () => {
    enableThirdPartyConsent()

    const { wrapper } = await mountWithPlugins(GoogleSignInButton, {})
    await flushPromises()

    expect(googleAuthUtil.loadGoogleIdentityScript).toHaveBeenCalled()
    expect(mockInitialize).toHaveBeenCalled()
    expect(mockRenderButton).toHaveBeenCalled()
    expect(wrapper.text()).not.toContain(i18n.global.t('cookies.google.consentRequired'))
  })

  it('emite success con el token de credencial', async () => {
    enableThirdPartyConsent()

    const { wrapper } = await mountWithPlugins(GoogleSignInButton, {})
    await flushPromises()

    const initCall = mockInitialize.mock.calls[0]?.[0]
    initCall.callback({ credential: 'google-id-token' })

    expect(wrapper.emitted('success')?.[0]).toEqual(['google-id-token'])
  })

  it('emite error cuando Google no devuelve credencial', async () => {
    enableThirdPartyConsent()

    const { wrapper } = await mountWithPlugins(GoogleSignInButton, {})
    await flushPromises()

    const initCall = mockInitialize.mock.calls[0]?.[0]
    initCall.callback({ credential: null })

    expect(wrapper.emitted('error')?.[0]).toEqual([i18n.global.t('google.noCredential')])
  })

  it('emite error cuando falla la carga del script', async () => {
    enableThirdPartyConsent()
    vi.mocked(googleAuthUtil.loadGoogleIdentityScript).mockRejectedValue(new Error('Load failed'))

    const { wrapper } = await mountWithPlugins(GoogleSignInButton, {})
    await flushPromises()

    expect(wrapper.emitted('error')?.[0]).toEqual(['Load failed'])
  })

  it('emite error cuando Google no está disponible tras cargar', async () => {
    enableThirdPartyConsent()
    delete (window as { google?: unknown }).google

    const { wrapper } = await mountWithPlugins(GoogleSignInButton, {})
    await flushPromises()

    expect(wrapper.emitted('error')?.[0]?.[0]).toContain(i18n.global.t('google.unavailable'))
  })

  it('muestra estado de conexión cuando está deshabilitado', async () => {
    enableThirdPartyConsent()

    const { wrapper } = await mountWithPlugins(GoogleSignInButton, {
      props: { disabled: true },
    })
    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('google.connectingGoogle'))
  })
})
