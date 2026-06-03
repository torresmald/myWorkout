import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'

import { createWorkout } from '@/__tests__/fixtures/workout.fixture'
import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import MyWorkouts from '@/components/MyWorkouts.vue'
import { i18n } from '@/i18n'
import type { WorkoutPublic } from '@/interfaces/workout.interface'

const defaultProps = {
  workouts: [] as WorkoutPublic[],
  loading: false,
  editingWorkoutId: null as number | null,
  deletingWorkoutId: null as number | null,
  openingSessionWorkoutId: null as number | null,
}

async function mountMyWorkouts(props: Partial<typeof defaultProps> = {}) {
  return mountWithPlugins(MyWorkouts, {
    props: { ...defaultProps, ...props },
  })
}

describe('MyWorkouts', () => {
  it('muestra skeleton mientras carga', async () => {
    const { wrapper } = await mountMyWorkouts({ loading: true })

    expect(wrapper.findComponent({ name: 'SkeletonList' }).exists()).toBe(true)
  })

  it('muestra estado vacío cuando no hay entrenamientos', async () => {
    const { wrapper } = await mountMyWorkouts()

    expect(wrapper.text()).toContain(i18n.global.t('empty.workouts.title'))
  })

  it('renderiza entrenamientos con estados y notas', async () => {
    const workouts = [
      createWorkout({ id: 1, name: 'Push', status: 'PLANNED', notes: 'Nota push' }),
      createWorkout({ id: 2, name: 'Pull', status: 'IN_PROGRESS' }),
      createWorkout({ id: 3, name: 'Legs', status: 'COMPLETED' }),
    ]

    const { wrapper } = await mountMyWorkouts({ workouts })

    expect(wrapper.text()).toContain('Push')
    expect(wrapper.text()).toContain('Nota push')
    expect(wrapper.text()).toContain(i18n.global.t('session.status.planned'))
    expect(wrapper.text()).toContain(i18n.global.t('session.status.inProgress'))
    expect(wrapper.text()).toContain(i18n.global.t('session.status.completed'))
  })

  it('resalta el entrenamiento en edición', async () => {
    const workouts = [createWorkout({ id: 1, name: 'Push' })]

    const { wrapper } = await mountMyWorkouts({ workouts, editingWorkoutId: 1 })

    expect(wrapper.find('li').classes()).toContain('bg-nav-active-bg')
  })

  it('emite session, edit y delete al interactuar', async () => {
    const workout = createWorkout({ id: 1, name: 'Push', status: 'PLANNED' })

    const { wrapper } = await mountMyWorkouts({ workouts: [workout] })

    const sessionButton = wrapper.find(
      `[aria-label="${i18n.global.t('workouts.list.startSession')}"]`,
    )
    await sessionButton.trigger('click')
    expect(wrapper.emitted('session')?.[0]).toEqual([workout])

    const actions = wrapper.findComponent({ name: 'ListItemIconActions' })
    actions.vm.$emit('edit')
    actions.vm.$emit('delete')
    await flushPromises()

    expect(wrapper.emitted('edit')?.[0]).toEqual([workout])
    expect(wrapper.emitted('delete')?.[0]).toEqual([workout])
  })

  it('oculta botón de sesión en entrenamientos completados', async () => {
    const workout = createWorkout({ id: 1, status: 'COMPLETED' })

    const { wrapper } = await mountMyWorkouts({ workouts: [workout] })

    expect(
      wrapper.find(`[aria-label="${i18n.global.t('workouts.list.startSession')}"]`).exists(),
    ).toBe(false)
    expect(
      wrapper.find(`[aria-label="${i18n.global.t('workouts.list.resumeSession')}"]`).exists(),
    ).toBe(false)
  })

  it('muestra spinner al abrir sesión y usa etiqueta de reanudar en progreso', async () => {
    const workout = createWorkout({ id: 1, status: 'IN_PROGRESS' })

    const { wrapper } = await mountMyWorkouts({
      workouts: [workout],
      openingSessionWorkoutId: 1,
    })

    expect(wrapper.findComponent({ name: 'LoadingSpinner' }).exists()).toBe(true)
    expect(
      wrapper.find(`[aria-label="${i18n.global.t('workouts.list.resumeSession')}"]`).exists(),
    ).toBe(true)
  })
})
