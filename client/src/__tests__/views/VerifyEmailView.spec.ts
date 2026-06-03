import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import { verifyEmailRoutes } from '@/__tests__/helpers/test-routes'
import * as authApi from '@/api/auth.api'
import VerifyEmailView from '@/views/VerifyEmailView.vue'
import { i18n } from '@/i18n'

vi.mock('@/api/auth.api', () => ({
  verifyEmail: vi.fn(),
}))

describe('VerifyEmailView', () => {
  beforeEach(() => {
    vi.mocked(authApi.verifyEmail).mockResolvedValue({
      messageCode: 'EMAIL_VERIFIED',
    })
  })

  it('verifica email con token válido', async () => {
    const { wrapper } = await mountWithPlugins(VerifyEmailView, {
      routes: verifyEmailRoutes,
      initialRoute: '/verify-email?token=abc123',
    })

    await flushPromises()

    expect(authApi.verifyEmail).toHaveBeenCalledWith('abc123')
    expect(wrapper.find('a[href="/login"]').exists()).toBe(true)
  })

  it('muestra error con token inválido', async () => {
    const { wrapper } = await mountWithPlugins(VerifyEmailView, {
      routes: verifyEmailRoutes,
      initialRoute: '/verify-email',
    })

    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('auth.verifyEmail.invalidLink'))
  })

  it('muestra error si falla la verificación', async () => {
    vi.mocked(authApi.verifyEmail).mockRejectedValue(new Error('expired'))

    const { wrapper } = await mountWithPlugins(VerifyEmailView, {
      routes: verifyEmailRoutes,
      initialRoute: '/verify-email?token=expired',
    })

    await flushPromises()

    expect(wrapper.text()).toContain('expired')
  })
})
