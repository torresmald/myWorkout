import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import RoutePageHeader from '@/components/layout/RoutePageHeader.vue'
import { i18n } from '@/i18n'
import { createTestRouter, navigateTo } from '@/__tests__/helpers/mount-test-app'

describe('RoutePageHeader', () => {
  it('usa props title y description cuando se proporcionan', () => {
    const router = createTestRouter()

    const wrapper = mount(RoutePageHeader, {
      props: {
        title: 'Título personalizado',
        description: 'Descripción personalizada',
      },
      global: { plugins: [router, i18n] },
    })

    expect(wrapper.text()).toContain('Título personalizado')
    expect(wrapper.text()).toContain('Descripción personalizada')
  })

  it('obtiene título y descripción desde meta de la ruta', async () => {
    const router = createTestRouter()

    const wrapper = mount(RoutePageHeader, {
      global: { plugins: [router, i18n] },
    })

    await navigateTo(router, '/exercise-catalog')

    expect(wrapper.text()).toContain(i18n.global.t('routes.exerciseCatalog.title'))
    expect(wrapper.text()).toContain(i18n.global.t('routes.exerciseCatalog.description'))
  })

  it('no renderiza PageHeader cuando no hay título', async () => {
    const router = createTestRouter()

    const wrapper = mount(RoutePageHeader, {
      global: { plugins: [router, i18n] },
    })

    await navigateTo(router, '/')

    expect(wrapper.find('h1').exists()).toBe(false)
  })

  it('omite descripción cuando la ruta no define pageDescriptionKey', async () => {
    const router = createTestRouter([
      {
        path: '/sin-descripcion',
        name: 'sin-descripcion',
        component: { template: '<div />' },
        meta: { titleKey: 'routes.exerciseCatalog.title' },
      },
    ])

    const wrapper = mount(RoutePageHeader, {
      global: { plugins: [router, i18n] },
    })

    await navigateTo(router, '/sin-descripcion')

    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.find('p').exists()).toBe(false)
  })
})
