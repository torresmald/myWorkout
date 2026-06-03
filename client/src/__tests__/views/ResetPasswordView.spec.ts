import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RouteRecordRaw } from 'vue-router'

import { mountWithPlugins, navigateTo } from '@/__tests__/helpers/mount-test-app'
import * as authApi from '@/api/auth.api'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import { i18n } from '@/i18n'
import { useToastStore } from '@/stores/toast.store'

vi.mock('@/api/auth.api', () => ({
  resetPassword: vi.fn(),
}))

const routes: RouteRecordRaw[] = [
  { path: '/reset-password', name: 'reset-password', component: { template: '<div />' } },
  { path: '/forgot-password', name: 'forgot-password', component: { template: '<div />' } },
  { path: '/login', name: 'login', component: { template: '<div />' } },
]

describe('ResetPasswordView', () => {
  beforeEach(() => {
    vi.mocked(authApi.resetPassword).mockResolvedValue({
      messageCode: 'PASSWORD_RESET_SUCCESS',
    })
  })

  it('muestra error con enlace inválido', async () => {
    const { router, wrapper } = await mountWithPlugins(ResetPasswordView, { routes })
    await navigateTo(router, '/reset-password')
    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('auth.resetPassword.invalidLink'))
  })

  it('restablece contraseña con token válido', async () => {
    const { pinia, router, wrapper } = await mountWithPlugins(ResetPasswordView, { routes })
    const toastStore = useToastStore(pinia)
    const successSpy = vi.spyOn(toastStore, 'success')

    await navigateTo(router, '/reset-password?token=valid-token')
    await flushPromises()

    await wrapper.find('#password').setValue('newpass123')
    await wrapper.find('#confirmPassword').setValue('newpass123')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(authApi.resetPassword).toHaveBeenCalledWith('valid-token', 'newpass123')
    expect(successSpy).toHaveBeenCalled()
    expect(wrapper.text()).toContain(i18n.global.t('auth.resetPassword.success'))
  })

  it('muestra error si las contraseñas no coinciden', async () => {
    const { pinia, router, wrapper } = await mountWithPlugins(ResetPasswordView, { routes })
    const toastStore = useToastStore(pinia)
    const errorSpy = vi.spyOn(toastStore, 'error')

    await navigateTo(router, '/reset-password?token=valid-token')
    await flushPromises()

    await wrapper.find('#password').setValue('newpass123')
    await wrapper.find('#confirmPassword').setValue('other')
    await wrapper.find('form').trigger('submit.prevent')

    expect(errorSpy).toHaveBeenCalledWith(i18n.global.t('auth.resetPassword.passwordsMismatch'))
    expect(authApi.resetPassword).not.toHaveBeenCalled()
  })
})
