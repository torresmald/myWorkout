import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import CookiesView from '@/views/CookiesView.vue'
import { i18n } from '@/i18n'
import { useCookieConsentStore } from '@/stores/cookie-consent.store'

describe('CookiesView', () => {
  it('muestra política de cookies e inventario', async () => {
    const { wrapper } = await mountWithPlugins(CookiesView)

    expect(wrapper.text()).toContain(i18n.global.t('cookies.policy.title'))
    expect(wrapper.text()).toContain(i18n.global.t('cookies.policy.inventoryTitle'))
    expect(wrapper.find('table').exists()).toBe(true)
  })

  it('abre preferencias de cookies', async () => {
    const { pinia, wrapper } = await mountWithPlugins(CookiesView)
    const cookieStore = useCookieConsentStore(pinia)
    const openSpy = vi.spyOn(cookieStore, 'openPreferences')

    const manageButton = wrapper.findAll('button').find((b) =>
      b.text().includes(i18n.global.t('cookies.policy.managePreferences')),
    )
    await manageButton!.trigger('click')

    expect(openSpy).toHaveBeenCalled()
  })
})
