import type { EmptyStateVariant } from '@/components/ui/EmptyState.vue'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import EmptyState from '@/components/ui/EmptyState.vue'
import { i18n } from '@/i18n'
import { createTestRouter } from '@/__tests__/helpers/mount-test-app'

const variants: EmptyStateVariant[] = [
  'workouts',
  'exercise-types',
  'exercises',
  'stats',
  'admin',
  'weight',
  'templates',
]

describe('EmptyState', () => {
  it('muestra título y descripción', () => {
    const router = createTestRouter()

    const wrapper = mount(EmptyState, {
      props: {
        variant: 'workouts',
        title: 'Sin entrenamientos',
        description: 'Crea tu primer entrenamiento',
      },
      global: { plugins: [router, i18n] },
    })

    expect(wrapper.find('h3').text()).toBe('Sin entrenamientos')
    expect(wrapper.text()).toContain('Crea tu primer entrenamiento')
  })

  it.each(variants)('renderiza ilustración para variante %s', (variant) => {
    const router = createTestRouter()

    const wrapper = mount(EmptyState, {
      props: {
        variant,
        title: 'Título',
        description: 'Desc',
      },
      global: { plugins: [router, i18n] },
    })

    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('muestra enlace RouterLink cuando hay actionLabel y actionTo', () => {
    const router = createTestRouter()

    const wrapper = mount(EmptyState, {
      props: {
        variant: 'workouts',
        title: 'Título',
        description: 'Desc',
        actionLabel: 'Ir',
        actionTo: '/workouts',
      },
      global: { plugins: [router, i18n] },
    })

    expect(wrapper.find('a').exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('emite action al pulsar botón cuando solo hay actionLabel', async () => {
    const router = createTestRouter()

    const wrapper = mount(EmptyState, {
      props: {
        variant: 'workouts',
        title: 'Título',
        description: 'Desc',
        actionLabel: 'Crear',
      },
      global: { plugins: [router, i18n] },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('action')).toHaveLength(1)
  })
})
