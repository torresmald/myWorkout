import { describe, expect, it, vi } from 'vitest'

import AppFooter from '@/components/layout/AppFooter.vue'
import { APP_NAME } from '@/constants/app.constants'
import { i18n } from '@/i18n'
import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import { useCookieConsentStore } from '@/stores/cookie-consent.store'

describe('AppFooter', () => {
  it('muestra enlaces de cookies y copyright', async () => {
    const { pinia, wrapper } = await mountWithPlugins(AppFooter)

    expect(wrapper.text()).toContain(i18n.global.t('cookies.footer.cookies'))
    expect(wrapper.text()).toContain(i18n.global.t('cookies.footer.preferences'))
    expect(wrapper.text()).toContain(APP_NAME)
    expect(wrapper.find('a[href="https://github.com/torresmald"]').exists()).toBe(true)
  })

  it('abre preferencias de cookies al pulsar el botón', async () => {
    const { pinia, wrapper } = await mountWithPlugins(AppFooter)
    const cookieStore = useCookieConsentStore(pinia)
    const openSpy = vi.spyOn(cookieStore, 'openPreferences')

    await wrapper.find('button').trigger('click')

    expect(openSpy).toHaveBeenCalled()
  })
})
