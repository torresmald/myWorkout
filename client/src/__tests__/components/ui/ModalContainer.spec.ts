import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'

import ModalContainer from '@/components/ui/ModalContainer.vue'
import { i18n } from '@/i18n'
import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import { useModalStore } from '@/stores/modal.store'

describe('ModalContainer', () => {
  let wrapper: VueWrapper | undefined

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    document.body.innerHTML = ''
  })

  function mountContainer() {
    const pinia = setupTestPinia()

    wrapper = mount(ModalContainer, {
      global: { plugins: [pinia, i18n] },
      attachTo: document.body,
    })

    return { pinia }
  }

  it('muestra mensaje y footer por defecto al confirmar', async () => {
    const { pinia } = mountContainer()
    const modalStore = useModalStore(pinia)

    modalStore.confirm({
      title: 'Confirmar',
      message: '¿Seguro?',
      confirmLabel: 'Sí',
      cancelLabel: 'No',
    })

    await wrapper!.vm.$nextTick()

    const dialog = document.body.querySelector('[role="dialog"]')
    expect(dialog?.textContent).toContain('¿Seguro?')
    expect(dialog?.textContent).toContain('Sí')
    expect(dialog?.textContent).toContain('No')
  })

  it('cierra con false al pulsar cancelar', async () => {
    const { pinia } = mountContainer()
    const modalStore = useModalStore(pinia)
    const closeSpy = vi.spyOn(modalStore, 'close')

    modalStore.confirm({
      title: 'Confirmar',
      message: 'Mensaje',
    })

    await wrapper!.vm.$nextTick()

    const cancelButton = Array.from(document.body.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes(i18n.global.t('common.cancel')),
    )
    await cancelButton?.click()

    expect(closeSpy).toHaveBeenCalledWith(false)
  })

  it('cierra con true al pulsar confirmar', async () => {
    const { pinia } = mountContainer()
    const modalStore = useModalStore(pinia)
    const closeSpy = vi.spyOn(modalStore, 'close')

    modalStore.confirm({
      title: 'Confirmar',
      message: 'Mensaje',
    })

    await wrapper!.vm.$nextTick()

    const confirmButton = Array.from(document.body.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes(i18n.global.t('common.confirm')),
    )
    await confirmButton?.click()

    expect(closeSpy).toHaveBeenCalledWith(true)
  })

  it('aplica estilo danger cuando confirmVariant es danger', async () => {
    const { pinia } = mountContainer()
    const modalStore = useModalStore(pinia)

    modalStore.confirm({
      title: 'Eliminar',
      message: '¿Eliminar?',
      variant: 'danger',
    })

    await wrapper!.vm.$nextTick()

    const confirmButton = Array.from(document.body.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes(i18n.global.t('common.confirm')),
    )
    expect(confirmButton?.className).toContain('bg-red-600')
  })

  it('renderiza contenedores personalizados sin footer por defecto', async () => {
    const { pinia } = mountContainer()
    const modalStore = useModalStore(pinia)

    modalStore.open({ title: 'Custom' })

    await wrapper!.vm.$nextTick()

    expect(document.getElementById('app-modal-content')).not.toBeNull()
    expect(document.getElementById('app-modal-footer')).not.toBeNull()
  })
})
