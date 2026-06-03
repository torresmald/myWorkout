import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import Skeleton from '@/components/ui/Skeleton.vue'

describe('Skeleton', () => {
  it('renderiza con dimensiones y redondeo por defecto', () => {
    const wrapper = mount(Skeleton)

    const el = wrapper.find('div')
    expect(el.attributes('style')).toContain('width: 100%')
    expect(el.attributes('style')).toContain('height: 1rem')
    expect(el.classes()).toContain('rounded-md')
  })

  it('acepta width, height y rounded personalizados', () => {
    const wrapper = mount(Skeleton, {
      props: { width: '50%', height: '2rem', rounded: 'full' },
    })

    const el = wrapper.find('div')
    expect(el.attributes('style')).toContain('width: 50%')
    expect(el.attributes('style')).toContain('height: 2rem')
    expect(el.classes()).toContain('rounded-full')
  })

  it('soporta redondeo none y sm', () => {
    const none = mount(Skeleton, { props: { rounded: 'none' } })
    const sm = mount(Skeleton, { props: { rounded: 'sm' } })
    const lg = mount(Skeleton, { props: { rounded: 'lg' } })

    expect(none.find('div').classes()).toContain('rounded-none')
    expect(sm.find('div').classes()).toContain('rounded-sm')
    expect(lg.find('div').classes()).toContain('rounded-lg')
  })
})
