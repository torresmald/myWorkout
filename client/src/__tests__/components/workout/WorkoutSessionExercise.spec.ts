import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { createWorkoutSessionDetail } from '@/__tests__/fixtures/workout-session.fixture'
import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import WorkoutSessionExercise from '@/components/workout/WorkoutSessionExercise.vue'
import { i18n } from '@/i18n'

describe('WorkoutSessionExercise', () => {
  it('renderiza ejercicio con series y descanso', async () => {
    const session = createWorkoutSessionDetail()
    const exercise = session.exercises[0]!

    const { wrapper } = await mountWithPlugins(WorkoutSessionExercise, {
      props: {
        exercise,
        updatingSetKey: null,
        personalRecordSetKeys: new Set<string>(),
      },
    })

    expect(wrapper.text()).toContain('Sentadilla')
    expect(wrapper.text()).toContain(
      i18n.global.t('workouts.exercises.restLabel', { seconds: exercise.restSeconds }),
    )
    expect(wrapper.findAllComponents({ name: 'WorkoutSetRow' })).toHaveLength(2)
  })

  it('abre modal de técnica cuando hay media', async () => {
    const session = createWorkoutSessionDetail()
    const exercise = session.exercises[0]!

    const { wrapper } = await mountWithPlugins(WorkoutSessionExercise, {
      props: {
        exercise,
        updatingSetKey: null,
        personalRecordSetKeys: new Set<string>(),
      },
      attachTo: document.body,
    })

    const techniqueButton = wrapper.findAll('button').find((b) =>
      b.text().includes(i18n.global.t('exerciseCatalog.viewTechnique')),
    )
    await techniqueButton!.trigger('click')
    await nextTick()

    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull()
  })

  it('emite toggleComplete al completar una serie', async () => {
    const session = createWorkoutSessionDetail()
    const exercise = session.exercises[0]!

    const { wrapper } = await mountWithPlugins(WorkoutSessionExercise, {
      props: {
        exercise,
        updatingSetKey: null,
        personalRecordSetKeys: new Set<string>(),
      },
    })

    const setRow = wrapper.findComponent({ name: 'WorkoutSetRow' })
    setRow.vm.$emit('toggleComplete', { reps: 10, weight: 80, completed: true })
    await flushPromises()

    expect(wrapper.emitted('toggleComplete')?.[0]).toEqual([
      {
        exerciseId: exercise.id,
        setNumber: 1,
        reps: 10,
        weight: 80,
        completed: true,
        restSeconds: exercise.restSeconds,
        isLastSet: false,
        exerciseName: exercise.exerciseType.name,
      },
    ])
  })

  it('oculta botón de técnica sin media en catálogo', async () => {
    const session = createWorkoutSessionDetail()
    const exercise = {
      ...session.exercises[0]!,
      exerciseType: {
        ...session.exercises[0]!.exerciseType,
        catalogExercise: null,
      },
    }

    const { wrapper } = await mountWithPlugins(WorkoutSessionExercise, {
      props: {
        exercise,
        updatingSetKey: null,
        personalRecordSetKeys: new Set<string>(),
      },
    })

    expect(wrapper.text()).not.toContain(i18n.global.t('exerciseCatalog.viewTechnique'))
  })
})
