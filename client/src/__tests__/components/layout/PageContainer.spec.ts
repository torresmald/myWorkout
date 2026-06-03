import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import PageContainer from '@/components/layout/PageContainer.vue'

describe('PageContainer', () => {
  it('renderiza el slot con ancho máximo por defecto', () => {
    const wrapper = mount(PageContainer, {
      slots: { default: '<p data-testid="content">Contenido</p>' },
    })

    expect(wrapper.find('[data-testid="content"]').exists()).toBe(true)
    expect(wrapper.classes()).toContain('max-w-2xl')
  })

  it('aplica max-w-3xl cuando maxWidth es 3xl', () => {
    const wrapper = mount(PageContainer, {
      props: { maxWidth: '3xl' },
    })

    expect(wrapper.classes()).toContain('max-w-3xl')
  })
})
