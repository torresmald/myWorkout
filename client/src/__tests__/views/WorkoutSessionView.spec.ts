import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createWorkoutSessionDetail } from '@/__tests__/fixtures/workout-session.fixture'
import { createUserPublic } from '@/__tests__/fixtures/profile.fixture'
import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import { workoutSessionRoutes } from '@/__tests__/helpers/test-routes'
import * as workoutSessionApi from '@/api/workout-session.api'
import * as workoutApi from '@/api/workout.api'
import WorkoutSessionView from '@/views/WorkoutSessionView.vue'
import { i18n } from '@/i18n'
import { useAuthStore } from '@/stores/auth.store'
import { useModalStore } from '@/stores/modal.store'
import { useToastStore } from '@/stores/toast.store'

vi.mock('@/api/workout-session.api', () => ({
  getWorkoutSession: vi.fn(),
  startWorkoutSession: vi.fn(),
  updateWorkoutSet: vi.fn(),
  finishWorkoutSession: vi.fn(),
}))

vi.mock('@/api/workout.api', () => ({
  getWorkouts: vi.fn(),
  getWorkout: vi.fn(),
  createWorkout: vi.fn(),
  updateWorkout: vi.fn(),
  deleteWorkout: vi.fn(),
}))

vi.mock('@/components/spotify/SpotifyPlayCard.vue', () => ({
  default: { template: '<div data-testid="spotify-card" />' },
}))

vi.mock('@/components/workout/RestTimerModal.vue', () => ({
  default: {
    props: ['open', 'exerciseName', 'remainingSeconds', 'totalSeconds', 'isPaused', 'isFinished'],
    template: '<div data-testid="rest-timer-modal" />',
  },
}))

describe('WorkoutSessionView', () => {
  beforeEach(() => {
    vi.mocked(workoutSessionApi.getWorkoutSession).mockResolvedValue(
      createWorkoutSessionDetail({ status: 'IN_PROGRESS' }),
    )
    vi.mocked(workoutSessionApi.startWorkoutSession).mockResolvedValue(
      createWorkoutSessionDetail({ status: 'IN_PROGRESS' }),
    )
    vi.mocked(workoutSessionApi.updateWorkoutSet).mockResolvedValue({
      set: createWorkoutSessionDetail().exercises[0]!.workoutSets[0]!,
      isPersonalRecord: true,
      previousMaxWeight: 75,
    })
    vi.mocked(workoutSessionApi.finishWorkoutSession).mockResolvedValue({
      id: 1,
      name: 'Leg day',
      status: 'COMPLETED',
      completedAt: '2026-01-15T12:00:00.000Z',
    })
    vi.mocked(workoutApi.getWorkouts).mockResolvedValue([])
  })

  it('carga sesión en progreso', async () => {
    const { pinia, wrapper } = await mountWithPlugins(WorkoutSessionView, {
      routes: workoutSessionRoutes,
      initialRoute: '/workouts/1/session',
    })
    useAuthStore(pinia).setUser(createUserPublic())

    await flushPromises()

    expect(wrapper.text()).toContain('Leg day')
    expect(wrapper.findComponent({ name: 'WorkoutSessionExercise' }).exists()).toBe(true)
  })

  it('muestra sesión completada', async () => {
    vi.mocked(workoutSessionApi.getWorkoutSession).mockResolvedValue(
      createWorkoutSessionDetail({ status: 'COMPLETED' }),
    )

    const { wrapper } = await mountWithPlugins(WorkoutSessionView, {
      routes: workoutSessionRoutes,
      initialRoute: '/workouts/1/session',
    })

    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('session.alreadyCompleted'))
  })

  it('inicia sesión planificada', async () => {
    vi.mocked(workoutSessionApi.getWorkoutSession).mockResolvedValue(
      createWorkoutSessionDetail({ status: 'PLANNED' }),
    )

    await mountWithPlugins(WorkoutSessionView, {
      routes: workoutSessionRoutes,
      initialRoute: '/workouts/1/session',
    })

    await flushPromises()

    expect(workoutSessionApi.startWorkoutSession).toHaveBeenCalledWith(1)
  })

  it('completa serie y muestra récord personal', async () => {
    const { pinia, wrapper } = await mountWithPlugins(WorkoutSessionView, {
      routes: workoutSessionRoutes,
      initialRoute: '/workouts/1/session',
    })
    const toastStore = useToastStore(pinia)
    const successSpy = vi.spyOn(toastStore, 'success')

    await flushPromises()

    const exercise = wrapper.findComponent({ name: 'WorkoutSessionExercise' })
    exercise.vm.$emit('toggleComplete', {
      exerciseId: 10,
      setNumber: 1,
      reps: 10,
      weight: 80,
      completed: true,
      restSeconds: 90,
      isLastSet: false,
      exerciseName: 'Sentadilla',
    })
    await flushPromises()

    expect(successSpy).toHaveBeenCalled()
  })

  it('finaliza sesión', async () => {
    const { pinia, router, wrapper } = await mountWithPlugins(WorkoutSessionView, {
      routes: workoutSessionRoutes,
      initialRoute: '/workouts/1/session',
    })
    const modalStore = useModalStore(pinia)
    vi.spyOn(modalStore, 'confirm').mockResolvedValue(true)

    await flushPromises()

    const finishButton = wrapper.findAll('button').find((b) =>
      b.text().includes(i18n.global.t('session.finishButton')),
    )
    await finishButton!.trigger('click')
    await flushPromises()

    expect(workoutSessionApi.finishWorkoutSession).toHaveBeenCalledWith(1)
    expect(router.currentRoute.value.name).toBe('workouts')
  })

  it('redirige si el id es inválido', async () => {
    const { router } = await mountWithPlugins(WorkoutSessionView, {
      routes: workoutSessionRoutes,
      initialRoute: '/workouts/invalid/session',
    })

    await flushPromises()

    expect(router.currentRoute.value.name).toBe('workouts')
  })
})
