import { describe, expect, it } from 'vitest'

import { createExerciseHistorySession } from '@/__tests__/fixtures/exercise-history.fixture'
import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import ExerciseHistoryChart from '@/components/exercise-history/ExerciseHistoryChart.vue'
import { i18n } from '@/i18n'

describe('ExerciseHistoryChart', () => {
  it('no renderiza nada con menos de 2 sesiones', async () => {
    const { wrapper } = await mountWithPlugins(ExerciseHistoryChart, {
      props: {
        exerciseTypeId: 5,
        exerciseName: 'Sentadilla',
        muscleGroup: 'LEGS',
        sessions: [createExerciseHistorySession()],
      },
    })

    expect(wrapper.find('section').exists()).toBe(false)
  })

  it('renderiza gráfico con datos de peso suficientes', async () => {
    const sessions = [
      createExerciseHistorySession({ workoutDate: '2026-01-01', maxWeight: 80 }),
      createExerciseHistorySession({ workoutId: 2, workoutDate: '2026-01-08', maxWeight: 85 }),
    ]

    const { wrapper } = await mountWithPlugins(ExerciseHistoryChart, {
      props: {
        exerciseTypeId: 5,
        exerciseName: 'Sentadilla',
        muscleGroup: 'LEGS',
        sessions,
      },
    })

    expect(wrapper.text()).toContain(i18n.global.t('exerciseHistory.chartTitle'))
    expect(wrapper.find('[data-testid="line-chart"]').exists()).toBe(true)
  })

  it('muestra aviso sin datos de peso', async () => {
    const sessions = [
      createExerciseHistorySession({
        workoutDate: '2026-01-01',
        maxWeight: null,
        setDetails: [{ setNumber: 1, reps: 15, weight: null, completedAt: null }],
      }),
      createExerciseHistorySession({
        workoutId: 2,
        workoutDate: '2026-01-08',
        maxWeight: null,
        setDetails: [{ setNumber: 1, reps: 20, weight: null, completedAt: null }],
      }),
    ]

    const { wrapper } = await mountWithPlugins(ExerciseHistoryChart, {
      props: {
        exerciseTypeId: 5,
        exerciseName: 'Flexiones',
        muscleGroup: 'CHEST',
        sessions,
      },
    })

    expect(wrapper.text()).toContain(i18n.global.t('stats.evolution.needMoreData'))
  })
})
