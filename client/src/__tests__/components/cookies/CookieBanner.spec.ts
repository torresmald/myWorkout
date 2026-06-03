import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'

import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import CookieBanner from '@/components/cookies/CookieBanner.vue'
import { i18n } from '@/i18n'
import { useCookieConsentStore } from '@/stores/cookie-consent.store'

describe('CookieBanner', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('muestra el banner cuando el usuario no ha respondido', async () => {
    const { pinia, wrapper } = await mountWithPlugins(CookieBanner)
    const store = useCookieConsentStore(pinia)

    expect(store.showBanner).toBe(true)
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    expect(wrapper.text()).toContain(i18n.global.t('cookies.banner.title'))
  })

  it('oculta el banner tras aceptar todas las cookies', async () => {
    const { pinia, wrapper } = await mountWithPlugins(CookieBanner)
    const store = useCookieConsentStore(pinia)

    await wrapper.findAll('button').at(-1)!.trigger('click')
    await flushPromises()

    expect(store.hasAnswered).toBe(true)
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('rechaza cookies no esenciales al pulsar el botón correspondiente', async () => {
    const { pinia, wrapper } = await mountWithPlugins(CookieBanner)
    const store = useCookieConsentStore(pinia)

    const rejectLabel = i18n.global.t('cookies.banner.rejectNonEssential')
    const rejectButton = wrapper.findAll('button').find((btn) => btn.text().includes(rejectLabel))
    await rejectButton!.trigger('click')
    await flushPromises()

    expect(store.preferences.analytics).toBe(false)
    expect(store.preferences.thirdParty).toBe(false)
  })

  it('abre preferencias al personalizar cookies', async () => {
    const { pinia, wrapper } = await mountWithPlugins(CookieBanner)
    const store = useCookieConsentStore(pinia)

    const customizeLabel = i18n.global.t('cookies.banner.customize')
    const customizeButton = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes(customizeLabel))
    await customizeButton!.trigger('click')
    await flushPromises()

    expect(store.preferencesModalOpen).toBe(true)
  })
})
