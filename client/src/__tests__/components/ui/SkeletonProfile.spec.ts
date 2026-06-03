import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import SkeletonProfile from '@/components/ui/SkeletonProfile.vue'

describe('SkeletonProfile', () => {
  it('renderiza secciones de perfil con placeholders', () => {
    const wrapper = mount(SkeletonProfile)

    expect(wrapper.findAll('section')).toHaveLength(3)
    expect(wrapper.findAll('.animate-pulse').length).toBeGreaterThan(0)
  })
})
