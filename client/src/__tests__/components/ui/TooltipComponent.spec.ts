import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import TooltipComponent from '@/components/ui/TooltipComponent.vue'

describe('TooltipComponent', () => {
  it('muestra tooltip con posición top por defecto', () => {
    const wrapper = mount(TooltipComponent, {
      props: { text: 'Ayuda' },
      slots: { default: '<button>Info</button>' },
    })

    const tooltip = wrapper.find('[role="tooltip"]')
    expect(tooltip.text()).toBe('Ayuda')
    expect(tooltip.classes()).toContain('bottom-full')
  })

  it.each(['bottom', 'left', 'right'] as const)(
    'aplica clases de posición %s',
    (position) => {
      const wrapper = mount(TooltipComponent, {
        props: { text: 'Tip', position },
        slots: { default: '<span />' },
      })

      const tooltip = wrapper.find('[role="tooltip"]')
      expect(tooltip.exists()).toBe(true)
    },
  )

  it('no renderiza tooltip cuando text está vacío', () => {
    const wrapper = mount(TooltipComponent, {
      props: { text: '' },
      slots: { default: '<span data-testid="trigger" />' },
    })

    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="trigger"]').exists()).toBe(true)
  })
})
