import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import GuestLayout from '@/components/layout/GuestLayout.vue'
import { createTestRouter, setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import { i18n } from '@/i18n'
import { useCookieConsentStore } from '@/stores/cookie-consent.store'

describe('GuestLayout', () => {
  it('renderiza logo, toggles y footer de cookies', async () => {
    const pinia = setupTestPinia()
    const router = createTestRouter()

    const wrapper = mount(GuestLayout, {
      global: {
        plugins: [pinia, router, i18n],
        stubs: {
          RouterView: { template: '<div data-testid="guest-view" />' },
          LanguageToggle: { template: '<div data-testid="lang-toggle" />' },
          ThemeToggle: { template: '<div data-testid="theme-toggle" />' },
        },
      },
    })

    await router.isReady()

    expect(wrapper.find('.guest-layout').exists()).toBe(true)
    expect(wrapper.find('[data-testid="guest-view"]').exists()).toBe(true)
    expect(wrapper.text()).toContain(i18n.global.t('cookies.footer.cookies'))
  })

  it('abre preferencias de cookies desde el footer', async () => {
    const pinia = setupTestPinia()
    const router = createTestRouter()
    const cookieStore = useCookieConsentStore(pinia)
    const openSpy = vi.spyOn(cookieStore, 'openPreferences')

    const wrapper = mount(GuestLayout, {
      global: {
        plugins: [pinia, router, i18n],
        stubs: {
          RouterView: true,
          LanguageToggle: true,
          ThemeToggle: true,
        },
      },
    })

    await router.isReady()

    const prefButton = wrapper.findAll('footer button')[0]
    await prefButton?.trigger('click')

    expect(openSpy).toHaveBeenCalled()
  })
})
