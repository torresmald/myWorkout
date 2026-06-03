import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createTestRouter,
  mountWithPlugins,
  navigateTo,
  setupTestPinia,
} from '@/__tests__/helpers/mount-test-app'
import App from '@/App.vue'
import { i18n } from '@/i18n'
import { useAuthStore } from '@/stores/auth.store'
import { useLocaleStore } from '@/stores/locale.store'
import * as documentTitleUtil from '@/utils/document-title.util'
import * as storageUtil from '@/utils/storage.util'

describe('App - bootstrap de arranque', () => {
  beforeEach(() => {
    vi.spyOn(storageUtil, 'getAccessToken').mockReturnValue(null)
    vi.spyOn(storageUtil, 'getRefreshToken').mockReturnValue(null)
  })

  it('muestra la pantalla de arranque mientras la sesión no está lista', async () => {
    const pinia = setupTestPinia()
    const authStore = useAuthStore(pinia)

    vi.spyOn(authStore, 'ensureAuthReady').mockReturnValue(new Promise(() => {}))

    const router = createTestRouter()
    const wrapper = mount(App, {
      global: {
        plugins: [pinia, router, i18n],
        stubs: {
          CookieBanner: true,
          CookiePreferencesModal: true,
        },
      },
    })

    await router.isReady()

    expect(wrapper.find('.app-bootstrap').exists()).toBe(true)
  })

  it('oculta la pantalla de arranque cuando ensureAuthReady termina sin sesión', async () => {
    const { wrapper } = await mountWithPlugins(App)

    await flushPromises()

    expect(wrapper.find('.app-bootstrap').exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'RouterView' }).isVisible()).toBe(true)
  })

  it('llama ensureAuthReady al montar', async () => {
    const pinia = setupTestPinia()
    const authStore = useAuthStore(pinia)
    const ensureSpy = vi.spyOn(authStore, 'ensureAuthReady').mockResolvedValue()

    const router = createTestRouter()
    mount(App, {
      global: {
        plugins: [pinia, router, i18n],
        stubs: {
          CookieBanner: true,
          CookiePreferencesModal: true,
        },
      },
    })

    await router.isReady()
    await flushPromises()

    expect(ensureSpy).toHaveBeenCalled()
  })

  it('actualiza el título del documento cuando cambia el locale', async () => {
    const pinia = setupTestPinia()
    const localeStore = useLocaleStore(pinia)
    const updateSpy = vi.spyOn(documentTitleUtil, 'updateDocumentTitle')

    const router = createTestRouter()
    mount(App, {
      global: {
        plugins: [pinia, router, i18n],
        stubs: {
          CookieBanner: true,
          CookiePreferencesModal: true,
        },
      },
    })

    await router.isReady()
    await navigateTo(router, '/exercise-catalog')
    await flushPromises()

    updateSpy.mockClear()
    localeStore.toggleLocale()
    await flushPromises()

    expect(updateSpy).toHaveBeenCalled()
  })

  it('renderiza contenedores globales de toast y modal', async () => {
    const { wrapper } = await mountWithPlugins(App)

    await flushPromises()

    expect(wrapper.findComponent({ name: 'ToastContainer' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ModalContainer' }).exists()).toBe(true)
  })
})
