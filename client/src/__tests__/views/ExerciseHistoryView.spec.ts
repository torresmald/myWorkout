import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createExerciseType } from '@/__tests__/fixtures/exercise-type.fixture'
import { createExerciseHistoryDetail } from '@/__tests__/fixtures/exercise-history.fixture'
import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import { exerciseHistoryRoutes } from '@/__tests__/helpers/test-routes'
import * as exerciseHistoryApi from '@/api/exercise-history.api'
import ExerciseHistoryView from '@/views/ExerciseHistoryView.vue'
import { i18n } from '@/i18n'

vi.mock('@/api/exercise-history.api', () => ({
  getExerciseHistory: vi.fn(),
}))

describe('ExerciseHistoryView', () => {
  beforeEach(() => {
    vi.mocked(exerciseHistoryApi.getExerciseHistory).mockResolvedValue(
      createExerciseHistoryDetail({
        exerciseType: createExerciseType({ id: 5, name: 'Sentadilla' }),
      }),
    )
  })

  it('carga historial del ejercicio', async () => {
    const { wrapper } = await mountWithPlugins(ExerciseHistoryView, {
      routes: exerciseHistoryRoutes,
      initialRoute: '/exercise-history/5',
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Sentadilla')
    expect(wrapper.text()).toContain(i18n.global.t('exerciseHistory.sessionsTitle'))
  })

  it('muestra estado vacío sin sesiones', async () => {
    vi.mocked(exerciseHistoryApi.getExerciseHistory).mockResolvedValue(
      createExerciseHistoryDetail({ sessions: [] }),
    )

    const { wrapper } = await mountWithPlugins(ExerciseHistoryView, {
      routes: exerciseHistoryRoutes,
      initialRoute: '/exercise-history/5',
    })

    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('exerciseHistory.empty'))
  })

  it('redirige con id inválido', async () => {
    const { router } = await mountWithPlugins(ExerciseHistoryView, {
      routes: exerciseHistoryRoutes,
      initialRoute: '/exercise-history/invalid',
    })

    await flushPromises()

    expect(router.currentRoute.value.name).toBe('exercise-types')
  })
})
