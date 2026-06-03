import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'

import AppModal from '@/components/ui/AppModal.vue'

function mountModal(props: { open?: boolean; title?: string | null } = {}): VueWrapper {
  return mount(AppModal, {
    props: {
      open: true,
      title: 'Título modal',
      ...props,
    },
    slots: {
      default: '<p data-testid="modal-body">Contenido</p>',
      footer: '<div data-testid="modal-footer">Pie</div>',
    },
    attachTo: document.body,
  })
}

describe('AppModal', () => {
  let wrapper: VueWrapper | undefined

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  it('teleporta el diálogo al body cuando está abierto', () => {
    wrapper = mountModal()

    const dialog = document.body.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(dialog?.textContent).toContain('Título modal')
    expect(document.body.querySelector('[data-testid="modal-body"]')).not.toBeNull()
  })

  it('no renderiza cuando open es false', () => {
    wrapper = mountModal({ open: false })

    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
  })

  it('emite close al pulsar el backdrop', async () => {
    wrapper = mountModal()

    const backdrop = document.body.querySelector('.bg-black\\/50')
    await backdrop?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(wrapper!.emitted('close')).toHaveLength(1)
  })

  it('emite close al pulsar Escape', async () => {
    wrapper = mountModal()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(wrapper!.emitted('close')).toHaveLength(1)
  })

  it('ignora teclas distintas de Escape', async () => {
    wrapper = mountModal()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))

    expect(wrapper!.emitted('close')).toBeUndefined()
  })

  it('bloquea scroll del body mientras está abierto', async () => {
    wrapper = mountModal({ open: false })

    await wrapper.setProps({ open: true })
    expect(document.body.style.overflow).toBe('hidden')

    await wrapper.setProps({ open: false })
    expect(document.body.style.overflow).toBe('')
  })

  it('restaura overflow al desmontar', () => {
    wrapper = mountModal()
    document.body.style.overflow = 'hidden'

    wrapper.unmount()
    wrapper = undefined

    expect(document.body.style.overflow).toBe('')
  })

  it('omite título cuando title es null', () => {
    wrapper = mountModal({ title: null })

    expect(document.body.querySelector('#app-modal-title')).toBeNull()
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull()
  })
})
