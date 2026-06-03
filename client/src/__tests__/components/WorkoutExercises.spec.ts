import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { createExerciseType } from '@/__tests__/fixtures/exercise-type.fixture'
import { createWorkoutExercise } from '@/__tests__/fixtures/workout.fixture'
import { getExposed } from '@/__tests__/helpers/component-vm'
import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import * as exerciseTypeApi from '@/api/exercise-type.api'
import * as workoutApi from '@/api/workout.api'
import WorkoutExercises from '@/components/WorkoutExercises.vue'
import { i18n } from '@/i18n'
import { useModalStore } from '@/stores/modal.store'
import { useToastStore } from '@/stores/toast.store'
import { useWorkoutStore } from '@/stores/workout.store'

vi.mock('@/api/workout.api', () => ({
  getWorkouts: vi.fn(),
  createWorkout: vi.fn(),
  updateWorkout: vi.fn(),
  deleteWorkout: vi.fn(),
  getWorkoutExercises: vi.fn(),
  createWorkoutExercise: vi.fn(),
  updateWorkoutExercise: vi.fn(),
  deleteWorkoutExercise: vi.fn(),
}))

vi.mock('@/api/exercise-type.api', () => ({
  getExerciseTypes: vi.fn(),
  createExerciseType: vi.fn(),
  updateExerciseType: vi.fn(),
  deleteExerciseType: vi.fn(),
}))

vi.mock('@/utils/rest-timer-sound.util', () => ({
  unlockRestTimerSound: vi.fn(),
  playRestTimerCompleteSound: vi.fn(),
}))

const mockExerciseType = createExerciseType()
const mockExercise = createWorkoutExercise()

async function fillExerciseForm(wrapper: Awaited<ReturnType<typeof mountWithPlugins>>['wrapper']) {
  await wrapper.find('#exerciseTypeId').setValue(String(mockExerciseType.id))
  await wrapper.find('#sets').setValue('3')
  await wrapper.find('#reps').setValue('10')
  await wrapper.find('#restSeconds').setValue('90')
  await wrapper.find('#weight').setValue('80')
}

describe('WorkoutExercises', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(exerciseTypeApi.getExerciseTypes).mockResolvedValue([mockExerciseType])
    vi.mocked(workoutApi.getWorkoutExercises).mockResolvedValue([mockExercise])
    vi.mocked(workoutApi.createWorkoutExercise).mockResolvedValue(mockExercise)
    vi.mocked(workoutApi.updateWorkoutExercise).mockResolvedValue(mockExercise)
  })

  describe('modo borrador', () => {
    it('muestra título de borrador y estado vacío', async () => {
      const { wrapper } = await mountWithPlugins(WorkoutExercises)
      await flushPromises()

      expect(wrapper.text()).toContain(i18n.global.t('workouts.exercises.draftTitle'))
      expect(wrapper.text()).toContain(i18n.global.t('empty.exercises.title'))
    })

    it('añade ejercicio al borrador', async () => {
      const { pinia, wrapper } = await mountWithPlugins(WorkoutExercises)
      const toastStore = useToastStore(pinia)
      await flushPromises()

      await fillExerciseForm(wrapper)
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(wrapper.text()).toContain('Sentadilla')
      expect(toastStore.toasts.some((t) => t.type === 'success')).toBe(true)
    })

    it('edita y elimina ejercicio en borrador', async () => {
      const { pinia, wrapper } = await mountWithPlugins(WorkoutExercises)
      await flushPromises()

      await fillExerciseForm(wrapper)
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(wrapper.findAll('li.stagger-item').length).toBe(1)

      const actions = wrapper.findComponent({ name: 'ListItemIconActions' })
      actions.vm.$emit('edit')
      await nextTick()

      await wrapper.find('#reps').setValue('12')
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(wrapper.text()).toContain('12')

      const modalStore = useModalStore(pinia)
      actions.vm.$emit('delete')
      await nextTick()
      modalStore.close(true)
      await flushPromises()

      expect(wrapper.findAll('li.stagger-item').length).toBe(0)
    })

    it('cancela edición de ejercicio en borrador', async () => {
      const { wrapper } = await mountWithPlugins(WorkoutExercises)
      await flushPromises()

      await fillExerciseForm(wrapper)
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      wrapper.findComponent({ name: 'ListItemIconActions' }).vm.$emit('edit')
      await nextTick()

      const cancelLabel = i18n.global.t('common.cancel')
      const cancelButton = wrapper.findAll('button').find((btn) => btn.text().includes(cancelLabel))
      await cancelButton!.trigger('click')

      expect(wrapper.text()).toContain(i18n.global.t('workouts.exercises.addTitle'))
    })

    it('no elimina borrador si el usuario cancela', async () => {
      const { pinia, wrapper } = await mountWithPlugins(WorkoutExercises)
      await flushPromises()

      await fillExerciseForm(wrapper)
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      const modalStore = useModalStore(pinia)
      wrapper.findComponent({ name: 'ListItemIconActions' }).vm.$emit('delete')
      await nextTick()
      modalStore.close(false)
      await flushPromises()

      expect(wrapper.findAll('li.stagger-item').length).toBe(1)
    })

    it('inicia temporizador de descanso en borrador', async () => {
      const { wrapper } = await mountWithPlugins(WorkoutExercises)
      await flushPromises()

      await fillExerciseForm(wrapper)
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      wrapper.findComponent({ name: 'ListItemIconActions' }).vm.$emit('timer')
      await nextTick()

      expect(wrapper.findComponent({ name: 'RestTimerModal' }).props('open')).toBe(true)
    })

    it('resetea formulario al eliminar borrador en edición', async () => {
      const { pinia, wrapper } = await mountWithPlugins(WorkoutExercises)
      const modalStore = useModalStore(pinia)
      await flushPromises()

      await fillExerciseForm(wrapper)
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      wrapper.findComponent({ name: 'ListItemIconActions' }).vm.$emit('edit')
      await nextTick()

      wrapper.findComponent({ name: 'ListItemIconActions' }).vm.$emit('delete')
      await nextTick()
      modalStore.close(true)
      await flushPromises()

      expect(wrapper.text()).toContain(i18n.global.t('workouts.exercises.addTitle'))
    })

    it('ignora temporizador cuando el descanso es cero', async () => {
      const { wrapper } = await mountWithPlugins(WorkoutExercises)
      await flushPromises()

      await wrapper.find('#exerciseTypeId').setValue(String(mockExerciseType.id))
      await wrapper.find('#sets').setValue('3')
      await wrapper.find('#reps').setValue('10')
      await wrapper.find('#restSeconds').setValue('0')
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      wrapper.findComponent({ name: 'ListItemIconActions' }).vm.$emit('timer')
      await nextTick()

      expect(wrapper.findComponent({ name: 'RestTimerModal' }).props('open')).toBe(false)
    })
  })

  describe('modo persistido', () => {
    it('carga ejercicios del entrenamiento', async () => {
      const { wrapper } = await mountWithPlugins(WorkoutExercises)
      await wrapper.setProps({ workoutId: 1 })
      await flushPromises()

      expect(workoutApi.getWorkoutExercises).toHaveBeenCalledWith(1)
      expect(wrapper.text()).toContain('Sentadilla')
    })

    it('reutiliza ejercicios en caché sin refetch', async () => {
      const { pinia, wrapper } = await mountWithPlugins(WorkoutExercises)
      const workoutStore = useWorkoutStore(pinia)
      workoutStore.hydrateExercises(1, [mockExercise])

      await wrapper.setProps({ workoutId: 1 })
      await flushPromises()

      expect(workoutApi.getWorkoutExercises).not.toHaveBeenCalled()
    })

    it('crea ejercicio persistido', async () => {
      const { pinia, wrapper } = await mountWithPlugins(WorkoutExercises)
      const toastStore = useToastStore(pinia)

      await wrapper.setProps({ workoutId: 1 })
      await flushPromises()

      await fillExerciseForm(wrapper)
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(workoutApi.createWorkoutExercise).toHaveBeenCalled()
      expect(toastStore.toasts.some((t) => t.type === 'success')).toBe(true)
    })

    it('actualiza ejercicio persistido', async () => {
      const { wrapper } = await mountWithPlugins(WorkoutExercises)

      await wrapper.setProps({ workoutId: 1 })
      await flushPromises()

      wrapper.findComponent({ name: 'ListItemIconActions' }).vm.$emit('edit')
      await nextTick()
      await wrapper.find('#reps').setValue('15')
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(workoutApi.updateWorkoutExercise).toHaveBeenCalled()
    })

    it('elimina ejercicio persistido tras confirmar', async () => {
      const { pinia, wrapper } = await mountWithPlugins(WorkoutExercises)
      const modalStore = useModalStore(pinia)
      vi.mocked(workoutApi.deleteWorkoutExercise).mockResolvedValue(createWorkoutExercise())

      await wrapper.setProps({ workoutId: 1 })
      await flushPromises()

      wrapper.findComponent({ name: 'ListItemIconActions' }).vm.$emit('delete')
      await nextTick()
      modalStore.close(true)
      await flushPromises()

      expect(workoutApi.deleteWorkoutExercise).toHaveBeenCalled()
    })

    it('muestra error al fallar carga de ejercicios', async () => {
      vi.mocked(workoutApi.getWorkoutExercises).mockRejectedValue(new Error('Load failed'))
      const { pinia, wrapper } = await mountWithPlugins(WorkoutExercises)
      const toastStore = useToastStore(pinia)

      await wrapper.setProps({ workoutId: 1 })
      await flushPromises()

      expect(toastStore.toasts.some((t) => t.type === 'error')).toBe(true)
    })

    it('no elimina ejercicio persistido si el usuario cancela', async () => {
      const { pinia, wrapper } = await mountWithPlugins(WorkoutExercises)
      const modalStore = useModalStore(pinia)

      await wrapper.setProps({ workoutId: 1 })
      await flushPromises()

      wrapper.findComponent({ name: 'ListItemIconActions' }).vm.$emit('delete')
      await nextTick()
      modalStore.close(false)
      await flushPromises()

      expect(wrapper.findAll('li.stagger-item').length).toBe(1)
    })

    it('resetea formulario al eliminar ejercicio en edición', async () => {
      const { pinia, wrapper } = await mountWithPlugins(WorkoutExercises)
      const modalStore = useModalStore(pinia)
      vi.mocked(workoutApi.deleteWorkoutExercise).mockResolvedValue(createWorkoutExercise())

      await wrapper.setProps({ workoutId: 1 })
      await flushPromises()

      wrapper.findComponent({ name: 'ListItemIconActions' }).vm.$emit('edit')
      await nextTick()

      wrapper.findComponent({ name: 'ListItemIconActions' }).vm.$emit('delete')
      await nextTick()
      modalStore.close(true)
      await flushPromises()

      expect(wrapper.text()).toContain(i18n.global.t('workouts.exercises.addTitle'))
    })

    it('muestra error al fallar actualización de ejercicio', async () => {
      vi.mocked(workoutApi.updateWorkoutExercise).mockRejectedValue(new Error('Update failed'))
      const { pinia, wrapper } = await mountWithPlugins(WorkoutExercises)
      const toastStore = useToastStore(pinia)

      await wrapper.setProps({ workoutId: 1 })
      await flushPromises()

      wrapper.findComponent({ name: 'ListItemIconActions' }).vm.$emit('edit')
      await nextTick()
      await wrapper.find('#reps').setValue('15')
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(toastStore.toasts.some((toast) => toast.type === 'error')).toBe(true)
    })

    it('muestra error al fallar creación de ejercicio', async () => {
      vi.mocked(workoutApi.createWorkoutExercise).mockRejectedValue(new Error('Create failed'))
      const { pinia, wrapper } = await mountWithPlugins(WorkoutExercises)
      const toastStore = useToastStore(pinia)

      await wrapper.setProps({ workoutId: 1 })
      await flushPromises()
      await fillExerciseForm(wrapper)
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(toastStore.toasts.some((toast) => toast.type === 'error')).toBe(true)
    })

    it('muestra error al fallar eliminación de ejercicio', async () => {
      vi.mocked(workoutApi.deleteWorkoutExercise).mockRejectedValue(new Error('Delete failed'))
      const { pinia, wrapper } = await mountWithPlugins(WorkoutExercises)
      const modalStore = useModalStore(pinia)
      const toastStore = useToastStore(pinia)

      await wrapper.setProps({ workoutId: 1 })
      await flushPromises()

      wrapper.findComponent({ name: 'ListItemIconActions' }).vm.$emit('delete')
      await nextTick()
      modalStore.close(true)
      await flushPromises()

      expect(toastStore.toasts.some((toast) => toast.type === 'error')).toBe(true)
    })
  })

  it('muestra aviso cuando no hay tipos de ejercicio', async () => {
    vi.mocked(exerciseTypeApi.getExerciseTypes).mockResolvedValue([])
    const { wrapper } = await mountWithPlugins(WorkoutExercises)
    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('workouts.exercises.noTypesWarning'))
    expect(wrapper.find('a[href="/exercise-types"]').exists()).toBe(true)
  })

  it('muestra error al fallar carga de tipos', async () => {
    vi.mocked(exerciseTypeApi.getExerciseTypes).mockRejectedValue(new Error('Types failed'))
    const { pinia, wrapper } = await mountWithPlugins(WorkoutExercises)
    const toastStore = useToastStore(pinia)
    await flushPromises()

    expect(toastStore.toasts.some((t) => t.type === 'error')).toBe(true)
  })

  it('resetea formulario al cambiar a modo borrador', async () => {
    const { wrapper } = await mountWithPlugins(WorkoutExercises)

    await wrapper.setProps({ workoutId: 1 })
    await flushPromises()
    wrapper.findComponent({ name: 'ListItemIconActions' }).vm.$emit('edit')
    await nextTick()

    await wrapper.setProps({ workoutId: undefined })
    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('workouts.exercises.addTitle'))
  })

  it('expone resetForm', async () => {
    const { wrapper } = await mountWithPlugins(WorkoutExercises)
    await flushPromises()

    getExposed<{ resetForm: () => void }>(wrapper).resetForm()
    expect(wrapper.text()).toContain(i18n.global.t('workouts.exercises.addTitle'))
  })
})
