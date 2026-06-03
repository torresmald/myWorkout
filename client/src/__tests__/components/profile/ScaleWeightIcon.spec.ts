import { describe, expect, it } from 'vitest'

import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import ScaleWeightIcon from '@/components/profile/ScaleWeightIcon.vue'

describe('ScaleWeightIcon', () => {
  it('renderiza el icono de báscula', async () => {
    const { wrapper } = await mountWithPlugins(ScaleWeightIcon, {
      props: { size: 40, tooltip: 'Añadir peso' },
    })

    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('svg').attributes('width')).toBe('40')
  })
})
