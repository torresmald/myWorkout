import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  it('renderiza svg animado con tamaño md por defecto', () => {
    const wrapper = mount(LoadingSpinner)

    expect(wrapper.find('svg.animate-spin').exists()).toBe(true)
    expect(wrapper.find('svg').classes()).toContain('h-5')
  })

  it('aplica tamaños sm y lg', () => {
    const sm = mount(LoadingSpinner, { props: { size: 'sm' } })
    const lg = mount(LoadingSpinner, { props: { size: 'lg' } })

    expect(sm.find('svg').classes()).toContain('h-4')
    expect(lg.find('svg').classes()).toContain('h-8')
  })
})
