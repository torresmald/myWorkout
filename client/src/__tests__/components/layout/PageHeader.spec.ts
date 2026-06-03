import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import PageHeader from '@/components/layout/PageHeader.vue'

describe('PageHeader', () => {
  it('muestra título y descripción', () => {
    const wrapper = mount(PageHeader, {
      props: {
        title: 'Mi página',
        description: 'Descripción de la página',
      },
    })

    expect(wrapper.find('h1').text()).toBe('Mi página')
    expect(wrapper.find('p').text()).toBe('Descripción de la página')
  })

  it('oculta la descripción cuando no se proporciona', () => {
    const wrapper = mount(PageHeader, {
      props: { title: 'Solo título' },
    })

    expect(wrapper.find('p').exists()).toBe(false)
  })
})
