import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import PasswordInput from '@/components/ui/PasswordInput.vue'
import { i18n } from '@/i18n'

describe('PasswordInput', () => {
  it('oculta la contraseña por defecto', () => {
    const wrapper = mount(PasswordInput, {
      props: { modelValue: 'secreto' },
      global: { plugins: [i18n] },
    })

    expect(wrapper.find('input').attributes('type')).toBe('password')
  })

  it('alterna visibilidad al pulsar el botón', async () => {
    const wrapper = mount(PasswordInput, {
      props: { modelValue: 'secreto' },
      global: { plugins: [i18n] },
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.find('input').attributes('type')).toBe('text')

    await wrapper.find('button').trigger('click')
    expect(wrapper.find('input').attributes('type')).toBe('password')
  })

  it('actualiza v-model al escribir', async () => {
    const wrapper = mount(PasswordInput, {
      props: { modelValue: '' },
      global: { plugins: [i18n] },
    })

    await wrapper.find('input').setValue('nueva-clave')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['nueva-clave'])
  })

  it('respeta disabled en input y botón de visibilidad', () => {
    const wrapper = mount(PasswordInput, {
      props: {
        modelValue: '',
        disabled: true,
        id: 'pwd',
        required: true,
        minlength: 8,
        autocomplete: 'current-password',
        placeholder: 'Contraseña',
      },
      global: { plugins: [i18n] },
    })

    const input = wrapper.find('input')
    expect(input.attributes('disabled')).toBeDefined()
    expect(input.attributes('id')).toBe('pwd')
    expect(input.attributes('minlength')).toBe('8')
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })
})
