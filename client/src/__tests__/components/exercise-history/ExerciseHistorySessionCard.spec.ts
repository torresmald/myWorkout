import { describe, expect, it } from 'vitest'

import { createExerciseHistorySession } from '@/__tests__/fixtures/exercise-history.fixture'
import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import ExerciseHistorySessionCard from '@/components/exercise-history/ExerciseHistorySessionCard.vue'
import { i18n } from '@/i18n'

describe('ExerciseHistorySessionCard', () => {
  it('muestra resumen de sesión y badge de récord', async () => {
    const session = createExerciseHistorySession({
      isPersonalRecord: true,
      source: 'LIVE',
    })

    const { wrapper } = await mountWithPlugins(ExerciseHistorySessionCard, {
      props: { session },
    })

    expect(wrapper.text()).toContain('Leg day')
    expect(wrapper.text()).toContain(i18n.global.t('personalRecords.badge'))
    expect(wrapper.text()).toContain(i18n.global.t('exerciseHistory.liveSession'))
  })

  it('expande y contrae detalle de series', async () => {
    const session = createExerciseHistorySession({ source: 'AGGREGATE' })

    const { wrapper } = await mountWithPlugins(ExerciseHistorySessionCard, {
      props: { session },
    })

    const toggleButton = wrapper.find('button')
    await toggleButton.trigger('click')

    expect(wrapper.text()).toContain(i18n.global.t('exerciseHistory.hideSets'))
    expect(wrapper.find('ul li').exists()).toBe(true)

    await toggleButton.trigger('click')
    expect(wrapper.text()).toContain(i18n.global.t('exerciseHistory.showSets'))
  })

  it('oculta botón de series cuando no hay detalle', async () => {
    const session = createExerciseHistorySession({ setDetails: [] })

    const { wrapper } = await mountWithPlugins(ExerciseHistorySessionCard, {
      props: { session },
    })

    expect(wrapper.find('button').exists()).toBe(false)
  })
})
