import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import SkeletonCardGrid from '@/components/ui/SkeletonCardGrid.vue'

describe('SkeletonCardGrid', () => {
  it('renderiza la cuadrícula por defecto con 6 tarjetas', () => {
    const wrapper = mount(SkeletonCardGrid)

    expect(wrapper.findAll('.animate-pulse')).toHaveLength(12)
  })

  it('respeta count y columns personalizados', () => {
    const wrapper = mount(SkeletonCardGrid, {
      props: { count: 2, columns: 2 },
    })

    expect(wrapper.classes()).toContain('sm:grid-cols-2')
    expect(wrapper.findAll('.animate-pulse')).toHaveLength(4)
  })

  it('usa 3 columnas en pantallas grandes cuando columns es 3', () => {
    const wrapper = mount(SkeletonCardGrid, {
      props: { columns: 3 },
    })

    expect(wrapper.classes()).toContain('lg:grid-cols-3')
  })
})
