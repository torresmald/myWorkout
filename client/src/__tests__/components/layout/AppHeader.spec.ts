import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import AppHeader from '@/components/layout/AppHeader.vue'
import { i18n } from '@/i18n'
import {
  createTestRouter,
  navigateTo,
  setupTestPinia,
} from '@/__tests__/helpers/mount-test-app'
import type { UserPublic } from '@/interfaces/auth.interface'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'

const mockUser: UserPublic = {
  id: 1,
  email: 'ana@test.com',
  name: 'Ana Test',
  role: 'USER',
  locale: 'es',
  createdAt: '2026-01-01T00:00:00.000Z',
    heightCm: null,
    targetWeightKg: null,
    profileImageUrl: null,
  spotifyPlaylistUrl: null,
  allowAutoPlaylist: false,
  restTimerSoundEnabled: true,
  showPrToast: true,
  confirmIncompleteFinish: true,
  spotifyConnected: false,
  spotifyDisplayName: null,
  spotifyPlaylistName: null,
  latestWeightKg: null,
  bmi: null,
  bmiCategory: null,
}

describe('AppHeader', () => {
  let wrapper: ReturnType<typeof mount> | undefined

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    document.body.innerHTML = ''
  })

  function mountHeader(options: { authenticated?: boolean } = {}) {
    const pinia = setupTestPinia()
    const authStore = useAuthStore(pinia)

    if (options.authenticated) {
      authStore.user = mockUser
    }

    const router = createTestRouter()

    wrapper = mount(AppHeader, {
      attachTo: document.body,
      global: {
        plugins: [pinia, router, i18n],
        stubs: {
          LanguageToggle: { template: '<div data-testid="lang-toggle" />' },
          ThemeToggle: { template: '<div data-testid="theme-toggle" />' },
          UserAvatar: { template: '<span data-testid="user-avatar" />' },
        },
      },
    })

    return { wrapper, pinia, router, authStore }
  }

  it('renderiza logo y toggles de idioma y tema', () => {
    const mounted = mountHeader()

    expect(mounted.wrapper.find('[data-testid="lang-toggle"]').exists()).toBe(true)
    expect(mounted.wrapper.find('[data-testid="theme-toggle"]').exists()).toBe(true)
  })

  it('muestra menú de usuario en escritorio cuando hay sesión', () => {
    const { wrapper } = mountHeader({ authenticated: true })

    expect(wrapper.find('#desktop-user-menu').exists()).toBe(true)
  })

  it('abre y cierra el menú de usuario en escritorio', async () => {
    const { wrapper } = mountHeader({ authenticated: true })

    const userButton = wrapper.find('#desktop-user-menu button')
    await userButton.trigger('click')

    expect(wrapper.find('[role="menu"]').exists()).toBe(true)

    await userButton.trigger('click')

    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })

  it('cierra menús al pulsar Escape', async () => {
    const { wrapper: header } = mountHeader({ authenticated: true })

    await header.find('#desktop-user-menu button').trigger('click')
    await nextTick()
    expect(header.find('[role="menu"]').exists()).toBe(true)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()

    expect(header.find('[role="menu"]').exists()).toBe(false)
  })

  it('cierra el menú de usuario al hacer clic fuera', async () => {
    const { wrapper: header } = mountHeader({ authenticated: true })

    await header.find('#desktop-user-menu button').trigger('click')
    await nextTick()
    expect(header.find('[role="menu"]').exists()).toBe(true)

    document.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    expect(header.find('[role="menu"]').exists()).toBe(false)
  })

  it('no cierra el menú de usuario al hacer clic dentro', async () => {
    const { wrapper } = mountHeader({ authenticated: true })

    await wrapper.find('#desktop-user-menu button').trigger('click')
    const menu = wrapper.find('[role="menu"]')

    await menu.trigger('click')

    expect(wrapper.find('[role="menu"]').exists()).toBe(true)
  })

  it('cierra menús al cambiar de ruta', async () => {
    const { wrapper, router } = mountHeader({ authenticated: true })

    await wrapper.find('#desktop-user-menu button').trigger('click')
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)

    await navigateTo(router, '/exercise-catalog')
    await flushPromises()

    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })

  it('resalta el enlace activo según la ruta', async () => {
    const { wrapper: header, router } = mountHeader()

    await navigateTo(router, '/')
    await flushPromises()

    const homeLink = header.findAll('nav a').find((link) => link.text().length > 0)
    expect(homeLink?.classes()).toContain('bg-nav-active-bg')
  })

  it('aplica clases inactivas a enlaces no seleccionados', async () => {
    const { wrapper: header, router } = mountHeader()

    await navigateTo(router, '/exercise-catalog')
    await flushPromises()

    const inactiveLink = header.findAll('nav a').find((link) => !link.classes().includes('bg-nav-active-bg'))
    expect(inactiveLink?.classes()).toContain('text-text-muted')
  })

  it('ignora teclas distintas de Escape', async () => {
    const { wrapper: header } = mountHeader({ authenticated: true })

    await header.find('#desktop-user-menu button').trigger('click')
    await nextTick()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await nextTick()

    expect(header.find('[role="menu"]').exists()).toBe(true)
  })

  it('no cierra el menú de usuario si el clic es dentro del contenedor', async () => {
    const { wrapper: header } = mountHeader({ authenticated: true })

    await header.find('#desktop-user-menu button').trigger('click')
    await nextTick()

    await header.find('#desktop-user-menu').trigger('click')
    await nextTick()

    expect(header.find('[role="menu"]').exists()).toBe(true)
  })

  it('muestra menú móvil sin bloque de usuario cuando no hay sesión', async () => {
    const { wrapper: header } = mountHeader()

    await header.find('[aria-controls="mobile-header-menu"]').trigger('click')

    expect(header.find('#mobile-header-menu').exists()).toBe(true)
    expect(header.find('#mobile-header-menu .border-b').exists()).toBe(false)
  })

  it('aplica clases activas en enlaces del menú móvil', async () => {
    const { wrapper: header, router } = mountHeader({ authenticated: true })

    await navigateTo(router, '/')
    await flushPromises()
    await header.find('[aria-controls="mobile-header-menu"]').trigger('click')

    const activeMobileLink = header.find('#mobile-header-menu nav a')
    expect(activeMobileLink.classes()).toContain('bg-nav-active-bg')
  })

  it('cierra menú móvil al pulsar de nuevo el botón de avatar', async () => {
    const { wrapper: header } = mountHeader({ authenticated: true })

    const mobileButton = header.find('[aria-controls="mobile-header-menu"]')
    await mobileButton.trigger('click')
    expect(header.find('#mobile-header-menu').exists()).toBe(true)

    await mobileButton.trigger('click')
    expect(header.find('#mobile-header-menu').exists()).toBe(false)
  })

  it('abre menú móvil y cierra menú de usuario en escritorio', async () => {
    const { wrapper: header } = mountHeader({ authenticated: true })

    await header.find('#desktop-user-menu button').trigger('click')
    expect(header.find('[role="menu"]').exists()).toBe(true)

    await header.find('[aria-controls="mobile-header-menu"]').trigger('click')

    expect(header.find('#mobile-header-menu').exists()).toBe(true)
    expect(header.find('[role="menu"]').exists()).toBe(false)
  })

  it('cierra menú móvil al pulsar enlace de navegación', async () => {
    const { wrapper } = mountHeader({ authenticated: true })

    await wrapper.find('[aria-controls="mobile-header-menu"]').trigger('click')
    expect(wrapper.find('#mobile-header-menu').exists()).toBe(true)

    const mobileNavLink = wrapper.find('#mobile-header-menu nav a')
    await mobileNavLink.trigger('click')

    expect(wrapper.find('#mobile-header-menu').exists()).toBe(false)
  })

  it('cierra sesión y redirige al login', async () => {
    const { wrapper, pinia, router } = mountHeader({ authenticated: true })
    const authStore = useAuthStore(pinia)
    const toastStore = useToastStore(pinia)
    const logoutSpy = vi.spyOn(authStore, 'logout')
    const toastSpy = vi.spyOn(toastStore, 'success')
    const pushSpy = vi.spyOn(router, 'push')

    await wrapper.find('#desktop-user-menu button').trigger('click')
    const logoutButton = wrapper.findAll('[role="menuitem"]').find((btn) =>
      btn.text().includes(i18n.global.t('layout.logout')),
    )
    await logoutButton?.trigger('click')

    expect(logoutSpy).toHaveBeenCalled()
    expect(toastSpy).toHaveBeenCalledWith(i18n.global.t('layout.logoutSuccess'))
    expect(pushSpy).toHaveBeenCalledWith('/login')
  })

  it('cierra sesión desde menú móvil', async () => {
    const { wrapper, pinia } = mountHeader({ authenticated: true })
    const authStore = useAuthStore(pinia)
    const logoutSpy = vi.spyOn(authStore, 'logout')

    await wrapper.find('[aria-controls="mobile-header-menu"]').trigger('click')
    const mobileLogout = wrapper.find('#mobile-header-menu button')
    await mobileLogout.trigger('click')

    expect(logoutSpy).toHaveBeenCalled()
  })

  it('muestra nombre por defecto cuando el usuario no tiene nombre', async () => {
    const pinia = setupTestPinia()
    const authStore = useAuthStore(pinia)
    authStore.user = { ...mockUser, name: '' }

    const router = createTestRouter()
    wrapper = mount(AppHeader, {
      attachTo: document.body,
      global: {
        plugins: [pinia, router, i18n],
        stubs: {
          LanguageToggle: true,
          ThemeToggle: true,
          UserAvatar: true,
        },
      },
    })

    await wrapper.find('[aria-controls="mobile-header-menu"]').trigger('click')

    expect(wrapper.text()).toContain(i18n.global.t('layout.myAccount'))
  })
})
