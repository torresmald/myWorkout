import { describe, expect, it } from 'vitest'

import { exerciseHistoryRoutes } from '@/__tests__/helpers/test-routes'
import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import PersonalRecordsList from '@/components/stats/PersonalRecordsList.vue'
import { i18n } from '@/i18n'
import type { PersonalRecordPublic } from '@/interfaces/personal-record.interface'

const mockRecord: PersonalRecordPublic = {
  exerciseTypeId: 5,
  exerciseName: 'Sentadilla',
  muscleGroup: 'LEGS',
  maxWeight: 100,
  reps: 5,
  achievedAt: '2026-01-15T00:00:00.000Z',
  workoutId: 1,
  workoutName: 'Leg day',
}

describe('PersonalRecordsList', () => {
  it('muestra skeleton mientras carga', async () => {
    const { wrapper } = await mountWithPlugins(PersonalRecordsList, {
      props: { records: [], loading: true },
    })

    expect(wrapper.findComponent({ name: 'SkeletonList' }).exists()).toBe(true)
  })

  it('muestra estado vacío sin récords', async () => {
    const { wrapper } = await mountWithPlugins(PersonalRecordsList, {
      props: { records: [], loading: false },
    })

    expect(wrapper.text()).toContain(i18n.global.t('personalRecords.empty'))
  })

  it('lista récords personales con enlace al historial', async () => {
    const { wrapper } = await mountWithPlugins(PersonalRecordsList, {
      routes: exerciseHistoryRoutes,
      props: { records: [mockRecord], loading: false },
    })

    expect(wrapper.text()).toContain('Sentadilla')
    expect(wrapper.text()).toContain(i18n.global.t('personalRecords.badge'))
    expect(wrapper.find('a').attributes('href')).toContain('/exercise-history/5')
  })
})
