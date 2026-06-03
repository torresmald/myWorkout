import { createWorkoutSet } from '@/__tests__/fixtures/workout-session.fixture'
import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import WorkoutSetRow from '@/components/workout/WorkoutSetRow.vue'
import { i18n } from '@/i18n'
import { describe, expect, it } from 'vitest'

describe('WorkoutSetRow', () => {
  it('renderiza número de serie y campos de reps/peso', async () => {
    const { wrapper } = await mountWithPlugins(WorkoutSetRow, {
      props: {
        set: createWorkoutSet({ setNumber: 2, reps: 8, weight: 60 }),
        saving: false,
      },
    })

    expect(wrapper.text()).toContain(i18n.global.t('session.setLabel', { number: 2 }))
    expect((wrapper.find(`#set-100-reps`).element as HTMLInputElement).value).toBe('8')
  })

  it('emite toggleComplete al completar serie válida', async () => {
    const { wrapper } = await mountWithPlugins(WorkoutSetRow, {
      props: {
        set: createWorkoutSet(),
        saving: false,
      },
    })

    await wrapper.find('button[aria-label]').trigger('click')

    expect(wrapper.emitted('toggleComplete')?.[0]).toEqual([
      { reps: 10, weight: 80, completed: true },
    ])
  })

  it('no emite si las repeticiones son inválidas', async () => {
    const { wrapper } = await mountWithPlugins(WorkoutSetRow, {
      props: {
        set: createWorkoutSet(),
        saving: false,
      },
    })

    await wrapper.find('#set-100-reps').setValue(0)
    await wrapper.find('button[aria-label]').trigger('click')

    expect(wrapper.emitted('toggleComplete')).toBeUndefined()
  })

  it('muestra badge de récord personal', async () => {
    const { wrapper } = await mountWithPlugins(WorkoutSetRow, {
      props: {
        set: createWorkoutSet(),
        saving: false,
        showPersonalRecord: true,
      },
    })

    expect(wrapper.text()).toContain(i18n.global.t('personalRecords.badge'))
  })

  it('sincroniza valores cuando cambia el set', async () => {
    const { wrapper } = await mountWithPlugins(WorkoutSetRow, {
      props: {
        set: createWorkoutSet({ reps: 10 }),
        saving: false,
      },
    })

    await wrapper.setProps({
      set: createWorkoutSet({ reps: 12, weight: 90 }),
    })

    expect((wrapper.find('#set-100-reps').element as HTMLInputElement).value).toBe('12')
  })

  it('permite descompletar serie ya completada', async () => {
    const { wrapper } = await mountWithPlugins(WorkoutSetRow, {
      props: {
        set: createWorkoutSet({ completedAt: '2026-01-15T10:00:00.000Z' }),
        saving: false,
      },
    })

    await wrapper.find('button[aria-label]').trigger('click')

    expect(wrapper.emitted('toggleComplete')?.[0]).toEqual([
      { reps: 10, weight: 80, completed: false },
    ])
  })
})
