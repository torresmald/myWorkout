import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import * as authApi from '@/api/auth.api'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import { i18n } from '@/i18n'
import { useToastStore } from '@/stores/toast.store'

vi.mock('@/api/auth.api', () => ({
  forgotPassword: vi.fn(),
}))

describe('ForgotPasswordView', () => {
  beforeEach(() => {
    vi.mocked(authApi.forgotPassword).mockResolvedValue({
      messageCode: 'PASSWORD_RESET_EMAIL_SENT',
    })
  })

  it('envía solicitud de recuperación', async () => {
    const { pinia, wrapper } = await mountWithPlugins(ForgotPasswordView)
    const toastStore = useToastStore(pinia)
    const successSpy = vi.spyOn(toastStore, 'success')

    await wrapper.find('#email').setValue('user@example.com')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(authApi.forgotPassword).toHaveBeenCalled()
    expect(successSpy).toHaveBeenCalled()
    expect(wrapper.text()).toContain(i18n.global.t('common.backToLogin'))
  })

  it('muestra error si falla la solicitud', async () => {
    vi.mocked(authApi.forgotPassword).mockRejectedValue(new Error('fail'))

    const { pinia, wrapper } = await mountWithPlugins(ForgotPasswordView)
    const toastStore = useToastStore(pinia)
    const errorSpy = vi.spyOn(toastStore, 'error')

    await wrapper.find('#email').setValue('user@example.com')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(errorSpy).toHaveBeenCalled()
  })
})
