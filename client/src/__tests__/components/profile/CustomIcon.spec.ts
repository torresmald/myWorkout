import { describe, expect, it } from 'vitest'

import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import CustomIcon from '@/components/profile/CustomIcon.vue'

describe('CustomIcon', () => {
  it('renderiza SVG sin tooltip cuando el texto está vacío', async () => {
    const { wrapper } = await mountWithPlugins(CustomIcon, {
      props: { size: 24 },
      stubs: { TooltipComponent: false },
    })

    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true')
  })

  it('envuelve el SVG con tooltip cuando hay texto', async () => {
    const { wrapper } = await mountWithPlugins(CustomIcon, {
      props: { tooltip: 'Ayuda', position: 'left' },
    })

    expect(wrapper.findComponent({ name: 'TooltipComponent' }).exists()).toBe(true)
    expect(wrapper.find('svg').attributes('aria-label')).toBe('Ayuda')
  })
})
