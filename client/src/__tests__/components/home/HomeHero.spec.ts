import { describe, expect, it } from 'vitest'

import { createWorkout } from '@/__tests__/fixtures/workout.fixture'
import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import HomeHero from '@/components/home/HomeHero.vue'
import { i18n } from '@/i18n'

describe('HomeHero', () => {
  it('muestra skeletons mientras carga', async () => {
    const { wrapper } = await mountWithPlugins(HomeHero, {
      props: { loading: true, streak: 0, lastWorkout: null },
    })

    expect(wrapper.findAllComponents({ name: 'Skeleton' }).length).toBeGreaterThan(0)
  })

  it('muestra racha en singular y último entrenamiento', async () => {
    const lastWorkout = createWorkout({ name: 'Leg day', date: '2026-01-15' })

    const { wrapper } = await mountWithPlugins(HomeHero, {
      props: { loading: false, streak: 1, lastWorkout },
    })

    expect(wrapper.text()).toContain(i18n.global.t('home.hero.title'))
    expect(wrapper.text()).toContain('Leg day')
    expect(wrapper.text()).toContain(i18n.global.t('home.hero.streakWeekSingular', { count: 1 }))
  })

  it('muestra racha en plural cuando hay más de una semana', async () => {
    const { wrapper } = await mountWithPlugins(HomeHero, {
      props: { loading: false, streak: 3, lastWorkout: null },
    })

    expect(wrapper.text()).toContain(i18n.global.t('home.hero.streakWeeks', { count: 3 }))
  })

  it('muestra enlace para crear primer entrenamiento sin historial', async () => {
    const { wrapper } = await mountWithPlugins(HomeHero, {
      props: { loading: false, streak: 0, lastWorkout: null },
    })

    expect(wrapper.text()).toContain(i18n.global.t('home.hero.noWorkoutsYet'))
    expect(wrapper.find('a[href="/workouts"]').exists()).toBe(true)
    expect(wrapper.text()).toContain(i18n.global.t('home.hero.createFirstWorkout'))
  })

  it('oculta enlace de crear entrenamiento cuando ya hay historial', async () => {
    const lastWorkout = createWorkout()

    const { wrapper } = await mountWithPlugins(HomeHero, {
      props: { loading: false, streak: 2, lastWorkout },
    })

    expect(wrapper.find('a[href="/workouts"]').exists()).toBe(false)
  })
})
