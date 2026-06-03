import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import LoginView from '@/views/LoginView.vue'
import { i18n } from '@/i18n'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { ApiError } from '@/utils/api-error.util'

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

describe('LoginView', () => {
  it('inicia sesión con email y contraseña', async () => {
    const { pinia, wrapper } = await mountWithPlugins(LoginView)
    const authStore = useAuthStore(pinia)
    const loginSpy = vi.spyOn(authStore, 'login').mockResolvedValue(undefined as never)
    const toastStore = useToastStore(pinia)
    const successSpy = vi.spyOn(toastStore, 'success')

    await wrapper.find('#email').setValue('user@example.com')
    await wrapper.find('#password').setValue('secret123')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(loginSpy).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret123',
    })
    expect(successSpy).toHaveBeenCalledWith(i18n.global.t('auth.login.success'))
  })

  it('muestra aviso de verificación pendiente', async () => {
    const { pinia, wrapper } = await mountWithPlugins(LoginView)
    const authStore = useAuthStore(pinia)
    vi.spyOn(authStore, 'login').mockRejectedValue(
      new ApiError('EMAIL_NOT_VERIFIED'),
    )

    await wrapper.find('#email').setValue('user@example.com')
    await wrapper.find('#password').setValue('secret123')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('auth.login.verificationNeeded'))
  })

  it('reenvía email de verificación', async () => {
    const { pinia, wrapper } = await mountWithPlugins(LoginView)
    const authStore = useAuthStore(pinia)
    vi.spyOn(authStore, 'login').mockRejectedValue(
      new ApiError('EMAIL_NOT_VERIFIED'),
    )
    const resendSpy = vi.spyOn(authStore, 'resendVerification').mockResolvedValue({
      messageCode: 'VERIFICATION_EMAIL_SENT',
    } as never)

    await wrapper.find('#email').setValue('user@example.com')
    await wrapper.find('#password').setValue('secret123')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    const resendButton = wrapper.findAll('button').find((b) =>
      b.text().includes(i18n.global.t('auth.login.resendVerification')),
    )
    await resendButton!.trigger('click')
    await flushPromises()

    expect(resendSpy).toHaveBeenCalledWith('user@example.com')
  })

  it('inicia sesión con Google', async () => {
    const { pinia, wrapper } = await mountWithPlugins(LoginView)
    const authStore = useAuthStore(pinia)
    const googleSpy = vi.spyOn(authStore, 'loginWithGoogle').mockResolvedValue(undefined as never)

    await wrapper.find('[data-testid="google-btn"]').trigger('click')
    await flushPromises()

    expect(googleSpy).toHaveBeenCalledWith('token')
  })
})
