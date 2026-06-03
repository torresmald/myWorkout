import { describe, expect, it } from 'vitest'

import { createExerciseEvolutionSeries } from '@/__tests__/fixtures/stats.fixture'
import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import ExerciseEvolutionChart from '@/components/stats/ExerciseEvolutionChart.vue'
import { i18n } from '@/i18n'

describe('ExerciseEvolutionChart', () => {
  it('muestra estado vacío sin series', async () => {
    const { wrapper } = await mountWithPlugins(ExerciseEvolutionChart, {
      props: { seriesList: [] },
    })

    expect(wrapper.text()).toContain(i18n.global.t('stats.evolution.empty'))
  })

  it('renderiza selector y gráfico con datos suficientes', async () => {
    const series = createExerciseEvolutionSeries()

    const { wrapper } = await mountWithPlugins(ExerciseEvolutionChart, {
      props: { seriesList: [series] },
    })

    expect(wrapper.find('#exercise-evolution-select').exists()).toBe(true)
    expect(wrapper.find('[data-testid="line-chart"]').exists()).toBe(true)
    expect(wrapper.text()).toContain(i18n.global.t('stats.evolution.trendMaxWeight'))
  })

  it('muestra aviso cuando hay pocos puntos de datos', async () => {
    const series = createExerciseEvolutionSeries({
      dataPoints: [
        {
          date: '2026-01-01',
          workoutId: 1,
          maxWeight: 80,
          volumeKg: 800,
          totalReps: 30,
        },
      ],
    })

    const { wrapper } = await mountWithPlugins(ExerciseEvolutionChart, {
      props: { seriesList: [series] },
    })

    expect(wrapper.text()).toContain(i18n.global.t('stats.evolution.needMoreData'))
  })

  it('muestra tendencia de repeticiones sin peso', async () => {
    const series = createExerciseEvolutionSeries({
      dataPoints: [
        {
          date: '2026-01-01',
          workoutId: 1,
          maxWeight: null,
          volumeKg: 0,
          totalReps: 20,
        },
        {
          date: '2026-01-08',
          workoutId: 2,
          maxWeight: null,
          volumeKg: 0,
          totalReps: 25,
        },
      ],
    })

    const { wrapper } = await mountWithPlugins(ExerciseEvolutionChart, {
      props: { seriesList: [series] },
    })

    expect(wrapper.text()).toContain(i18n.global.t('stats.evolution.trendReps'))
  })
})
