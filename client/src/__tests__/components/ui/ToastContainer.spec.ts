import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import ToastContainer from '@/components/ui/ToastContainer.vue'
import { i18n } from '@/i18n'
import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import { useToastStore } from '@/stores/toast.store'

describe('ToastContainer', () => {
  it('muestra toasts de éxito y error', () => {
    const pinia = setupTestPinia()
    const toastStore = useToastStore(pinia)

    toastStore.success('Operación correcta')
    toastStore.error('Algo falló')

    const wrapper = mount(ToastContainer, {
      global: { plugins: [pinia, i18n] },
    })

    const alerts = wrapper.findAll('[role="alert"]')
    expect(alerts).toHaveLength(2)
    expect(alerts[0]?.text()).toContain('Operación correcta')
    expect(alerts[1]?.text()).toContain('Algo falló')
    expect(alerts[0]?.classes().some((c) => c.includes('green'))).toBe(true)
    expect(alerts[1]?.classes().some((c) => c.includes('red'))).toBe(true)
  })

  it('elimina toast al pulsar cerrar', async () => {
    const pinia = setupTestPinia()
    const toastStore = useToastStore(pinia)
    const removeSpy = vi.spyOn(toastStore, 'remove')

    toastStore.success('Mensaje')

    const wrapper = mount(ToastContainer, {
      global: { plugins: [pinia, i18n] },
    })

    await wrapper.find('button').trigger('click')

    expect(removeSpy).toHaveBeenCalled()
  })
})
