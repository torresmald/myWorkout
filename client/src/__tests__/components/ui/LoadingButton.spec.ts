import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import LoadingButton from '@/components/ui/LoadingButton.vue'

describe('LoadingButton', () => {
  it('renderiza slot y se deshabilita al cargar', () => {
    const wrapper = mount(LoadingButton, {
      props: { loading: true },
      slots: { default: 'Guardar' },
    })

    expect(wrapper.text()).toContain('Guardar')
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.animate-spin').exists()).toBe(true)
  })

  it('respeta disabled y variant secondary', () => {
    const wrapper = mount(LoadingButton, {
      props: { disabled: true, variant: 'secondary', type: 'button' },
      slots: { default: 'Cancelar' },
    })

    expect(wrapper.find('button').attributes('type')).toBe('button')
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('permite enviar formulario con type submit por defecto', () => {
    const wrapper = mount(LoadingButton, {
      slots: { default: 'Enviar' },
    })

    expect(wrapper.find('button').attributes('type')).toBe('submit')
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
  })
})
