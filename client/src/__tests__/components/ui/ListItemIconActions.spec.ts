import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import ListItemIconActions from '@/components/ui/ListItemIconActions.vue'
import { i18n } from '@/i18n'

describe('ListItemIconActions', () => {
  it('emite edit y delete al pulsar los botones', async () => {
    const wrapper = mount(ListItemIconActions, {
      global: { plugins: [i18n] },
    })

    const buttons = wrapper.findAll('button')
    await buttons[0]?.trigger('click')
    await buttons[1]?.trigger('click')

    expect(wrapper.emitted('edit')).toHaveLength(1)
    expect(wrapper.emitted('delete')).toHaveLength(1)
  })

  it('muestra botón de temporizador cuando showTimer es true', async () => {
    const wrapper = mount(ListItemIconActions, {
      props: { showTimer: true },
      global: { plugins: [i18n] },
    })

    expect(wrapper.findAll('button')).toHaveLength(3)

    await wrapper.findAll('button')[0]?.trigger('click')

    expect(wrapper.emitted('timer')).toHaveLength(1)
  })

  it('muestra spinner al eliminar y deshabilita acciones', () => {
    const wrapper = mount(ListItemIconActions, {
      props: { deleting: true, disabled: true },
      global: { plugins: [i18n] },
    })

    expect(wrapper.find('.animate-spin').exists()).toBe(true)
    wrapper.findAll('button').forEach((button) => {
      expect(button.attributes('disabled')).toBeDefined()
    })
  })
})
