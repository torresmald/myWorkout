import { flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import RegisterView from '@/views/RegisterView.vue'
import { i18n } from '@/i18n'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'

vi.mock('@/composables/useAuthRedirect', () => ({
  useAuthRedirect: () => ({
    redirectAfterAuth: vi.fn().mockResolvedValue(undefined),
  }),
}))

vi.mock('@/components/auth/GoogleSignInButton.vue', () => ({
  default: {
    name: 'GoogleSignInButton',
    emits: ['success', 'error'],
    template: '<button data-testid="google-btn" @click="$emit(\'success\', \'token\')">Google</button>',
  },
}))

describe('RegisterView', () => {
  it('registra usuario y muestra pantalla de verificación', async () => {
    const { pinia, wrapper } = await mountWithPlugins(RegisterView)
    const authStore = useAuthStore(pinia)
    vi.spyOn(authStore, 'register').mockResolvedValue({
      email: 'new@example.com',
      messageCode: 'REGISTRATION_SUCCESS',
    } as never)

    await wrapper.find('#name').setValue('Nuevo')
    await wrapper.find('#email').setValue('new@example.com')
    await wrapper.find('#password').setValue('secret123')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('new@example.com')
    expect(wrapper.text()).toContain(i18n.global.t('auth.register.checkEmail'))
  })

  it('reenvía verificación tras registro', async () => {
    const { pinia, wrapper } = await mountWithPlugins(RegisterView)
    const authStore = useAuthStore(pinia)
    vi.spyOn(authStore, 'register').mockResolvedValue({
      email: 'new@example.com',
      messageCode: 'REGISTRATION_SUCCESS',
    } as never)
    const resendSpy = vi.spyOn(authStore, 'resendVerification').mockResolvedValue({
      messageCode: 'VERIFICATION_EMAIL_SENT',
    } as never)

    await wrapper.find('#email').setValue('new@example.com')
    await wrapper.find('#password').setValue('secret123')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(resendSpy).toHaveBeenCalledWith('new@example.com')
  })

  it('registra con Google', async () => {
    const { pinia, wrapper } = await mountWithPlugins(RegisterView)
    const authStore = useAuthStore(pinia)
    const googleSpy = vi.spyOn(authStore, 'loginWithGoogle').mockResolvedValue(undefined as never)
    const toastStore = useToastStore(pinia)
    const successSpy = vi.spyOn(toastStore, 'success')

    await wrapper.find('[data-testid="google-btn"]').trigger('click')
    await flushPromises()

    expect(googleSpy).toHaveBeenCalledWith('token')
    expect(successSpy).toHaveBeenCalledWith(i18n.global.t('auth.register.successLogin'))
  })
})
