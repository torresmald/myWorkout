import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import SkeletonList from '@/components/ui/SkeletonList.vue'

describe('SkeletonList', () => {
  it('renderiza 4 filas por defecto', () => {
    const wrapper = mount(SkeletonList)

    expect(wrapper.findAll('li')).toHaveLength(4)
  })

  it('respeta el prop count', () => {
    const wrapper = mount(SkeletonList, {
      props: { count: 2 },
    })

    expect(wrapper.findAll('li')).toHaveLength(2)
  })
})
