import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import AppLogo from '@/components/layout/AppLogo.vue'
import { APP_NAME } from '@/constants/app.constants'

describe('AppLogo', () => {
  it('muestra solo el icono por defecto', () => {
    const wrapper = mount(AppLogo)

    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.text()).not.toContain(APP_NAME)
  })

  it('muestra el nombre de la app cuando showText es true', () => {
    const wrapper = mount(AppLogo, {
      props: { showText: true },
    })

    expect(wrapper.text()).toContain(APP_NAME)
  })

  it('aplica clases de tamaño sm, md y lg', () => {
    const sm = mount(AppLogo, { props: { size: 'sm' } })
    const md = mount(AppLogo, { props: { size: 'md' } })
    const lg = mount(AppLogo, { props: { size: 'lg' } })

    expect(sm.find('svg').classes()).toContain('h-8')
    expect(md.find('svg').classes()).toContain('h-9')
    expect(lg.find('svg').classes()).toContain('h-12')
  })

  it('aplica estilo invertido al texto cuando inverted es true', () => {
    const wrapper = mount(AppLogo, {
      props: { showText: true, inverted: true },
    })

    expect(wrapper.find('.text-white').exists()).toBe(true)
  })
})
