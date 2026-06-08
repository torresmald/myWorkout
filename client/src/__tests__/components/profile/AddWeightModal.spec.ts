import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import AddWeightModal from '@/components/profile/AddWeightModal.vue'
import { i18n } from '@/i18n'

const modalStub = {
  template: '<div v-if="open"><slot /></div>',
  props: ['open', 'title'],
  emits: ['close'],
}

describe('AddWeightModal', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('emite submit con peso válido', async () => {
    const { wrapper } = await mountWithPlugins(AddWeightModal, {
      props: { open: true },
      stubs: { AppModal: modalStub },
    })

    await wrapper.find('#add-weight-input').setValue('75.5')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')?.[0]).toEqual([75.5])
  })

  it('muestra error con peso inválido', async () => {
    const { wrapper } = await mountWithPlugins(AddWeightModal, {
      props: { open: true },
      stubs: { AppModal: modalStub },
    })

    await wrapper.find('#add-weight-input').setValue('10')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('20')
    expect(wrapper.text()).toContain('500')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('no emite close mientras loading', async () => {
    const { wrapper } = await mountWithPlugins(AddWeightModal, {
      props: { open: true, loading: true },
      stubs: { AppModal: modalStub },
    })

    await wrapper.find('button[type="button"]').trigger('click')

    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('resetea el formulario al abrir', async () => {
    const { wrapper } = await mountWithPlugins(AddWeightModal, {
      props: { open: false },
      stubs: { AppModal: modalStub },
    })

    await wrapper.setProps({ open: true })
    await nextTick()

    expect((wrapper.find('#add-weight-input').element as HTMLInputElement).value).toBe('')
  })

  it('emite close al cancelar', async () => {
    const { wrapper } = await mountWithPlugins(AddWeightModal, {
      props: { open: true },
      stubs: { AppModal: modalStub },
    })

    await wrapper.find('button[type="button"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
