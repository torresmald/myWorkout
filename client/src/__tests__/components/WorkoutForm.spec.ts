import { flushPromises } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { createExerciseType } from '@/__tests__/fixtures/exercise-type.fixture'
import { createWorkout, createWorkoutExercise } from '@/__tests__/fixtures/workout.fixture'
import { getExposed } from '@/__tests__/helpers/component-vm'
import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import * as exerciseTypeApi from '@/api/exercise-type.api'
import * as templateApi from '@/api/template.api'
import * as workoutApi from '@/api/workout.api'
import type { WorkoutPublic } from '@/interfaces/workout.interface'
import WorkoutForm from '@/components/WorkoutForm.vue'
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

vi.mock('@/api/template.api', () => ({
  getTemplates: vi.fn(),
  createTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
  getTemplateExercises: vi.fn(),
  createTemplateExercise: vi.fn(),
  updateTemplateExercise: vi.fn(),
  deleteTemplateExercise: vi.fn(),
}))

vi.mock('@/api/exercise-type.api', () => ({
  getExerciseTypes: vi.fn(),
}))

vi.mock('@/utils/rest-timer-sound.util', () => ({
  unlockRestTimerSound: vi.fn(),
  playRestTimerCompleteSound: vi.fn(),
}))

const mockExerciseType = createExerciseType()
const mockWorkout = createWorkout()
const mockExercise = createWorkoutExercise()

type WorkoutFormExposed = {
  startEdit: (workout: WorkoutPublic) => Promise<void>
  resetForm: () => void
  editingWorkoutId: number | null
}

async function clickFormPrimaryButton(wrapper: VueWrapper) {
  const actionSection = wrapper.findAll('section').at(-1)!
  const primaryButton = actionSection
    .findAll('button')
    .find((button) => button.attributes('disabled') === undefined)
  await primaryButton!.trigger('click')
}

describe('WorkoutForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Element.prototype.scrollIntoView = vi.fn()
    vi.mocked(exerciseTypeApi.getExerciseTypes).mockResolvedValue([mockExerciseType])
    vi.mocked(workoutApi.getWorkouts).mockResolvedValue([mockWorkout])
    vi.mocked(workoutApi.createWorkout).mockResolvedValue(mockWorkout)
    vi.mocked(workoutApi.updateWorkout).mockResolvedValue(mockWorkout)
    vi.mocked(workoutApi.getWorkoutExercises).mockResolvedValue([mockExercise])
    vi.mocked(templateApi.getTemplates).mockResolvedValue([])
    vi.mocked(templateApi.createTemplate).mockResolvedValue({
      id: 99,
      name: 'Template',
      description: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
  })

  it('muestra formulario de nuevo entrenamiento', async () => {
    const { wrapper } = await mountWithPlugins(WorkoutForm)

    expect(wrapper.text()).toContain(i18n.global.t('workouts.form.newTitle'))
    expect(wrapper.find('#workout-name').exists()).toBe(true)
  })

  it('valida nombre obligatorio al enviar el formulario', async () => {
    const { pinia, wrapper } = await mountWithPlugins(WorkoutForm)
    const toastStore = useToastStore(pinia)

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(toastStore.toasts.some((toast) => toast.type === 'error')).toBe(true)
    expect(workoutApi.createWorkout).not.toHaveBeenCalled()
  })

  it('valida fecha obligatoria', async () => {
    const { pinia, wrapper } = await mountWithPlugins(WorkoutForm)
    const toastStore = useToastStore(pinia)

    await wrapper.find('#workout-name').setValue('Leg day')
    await wrapper.find('#workout-date').setValue('')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(toastStore.toasts.some((toast) => toast.type === 'error')).toBe(true)
  })

  it('crea un entrenamiento sin ejercicios', async () => {
    const { pinia, wrapper } = await mountWithPlugins(WorkoutForm)
    const toastStore = useToastStore(pinia)

    await wrapper.find('#workout-name').setValue('Leg day')
    await clickFormPrimaryButton(wrapper)
    await flushPromises()

    expect(workoutApi.createWorkout).toHaveBeenCalled()
    expect(toastStore.toasts.some((toast) => toast.type === 'success')).toBe(true)
    expect(wrapper.text()).toContain(i18n.global.t('workouts.form.editTitle'))
  })

  it('crea entrenamiento con ejercicios en borrador', async () => {
    vi.mocked(workoutApi.createWorkout).mockResolvedValue({
      ...mockWorkout,
      exercises: [mockExercise],
    })

    const { wrapper } = await mountWithPlugins(WorkoutForm)
    await flushPromises()

    await wrapper.find('#exerciseTypeId').setValue(String(mockExerciseType.id))
    await wrapper.find('#sets').setValue('3')
    await wrapper.find('#reps').setValue('10')
    await wrapper.find('#restSeconds').setValue('60')
    await wrapper.findComponent({ name: 'WorkoutExercises' }).find('form').trigger('submit.prevent')
    await flushPromises()

    await wrapper.find('#workout-name').setValue('Leg day')
    await clickFormPrimaryButton(wrapper)
    await flushPromises()

    expect(workoutApi.createWorkout).toHaveBeenCalledWith(
      expect.objectContaining({ exercises: expect.any(Array) }),
    )
  })

  it('actualiza un entrenamiento en modo edición', async () => {
    const { wrapper } = await mountWithPlugins(WorkoutForm)

    await getExposed<WorkoutFormExposed>(wrapper).startEdit(createWorkout({ id: 1, name: 'Push', notes: 'Notas' }))
    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('workouts.form.editingHint'))
    await wrapper.find('#workout-name').setValue('Push updated')
    await clickFormPrimaryButton(wrapper)
    await flushPromises()

    expect(workoutApi.updateWorkout).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ name: 'Push updated' }),
    )
  })

  it('muestra error al fallar la creación', async () => {
    vi.mocked(workoutApi.createWorkout).mockRejectedValue(new Error('Network error'))
    const { pinia, wrapper } = await mountWithPlugins(WorkoutForm)
    const toastStore = useToastStore(pinia)

    await wrapper.find('#workout-name').setValue('Leg day')
    await clickFormPrimaryButton(wrapper)
    await flushPromises()

    expect(toastStore.toasts.some((toast) => toast.type === 'error')).toBe(true)
  })

  it('muestra error al fallar la actualización', async () => {
    vi.mocked(workoutApi.updateWorkout).mockRejectedValue(new Error('Update failed'))
    const { pinia, wrapper } = await mountWithPlugins(WorkoutForm)
    const toastStore = useToastStore(pinia)

    await getExposed<WorkoutFormExposed>(wrapper).startEdit(createWorkout({ id: 1, name: 'Push' }))
    await wrapper.find('#workout-name').setValue('Push updated')
    await clickFormPrimaryButton(wrapper)
    await flushPromises()

    expect(toastStore.toasts.some((toast) => toast.type === 'error')).toBe(true)
  })

  it('reinicia el formulario al crear nuevo entrenamiento', async () => {
    const { wrapper } = await mountWithPlugins(WorkoutForm)

    await getExposed<WorkoutFormExposed>(wrapper).startEdit(createWorkout({ id: 1, name: 'Push' }))
    const newWorkoutLabel = i18n.global.t('workouts.form.newWorkoutButton')
    const newButton = wrapper.findAll('button').find((btn) => btn.text().includes(newWorkoutLabel))
    await newButton!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('workouts.form.newTitle'))
    expect(getExposed<WorkoutFormExposed>(wrapper).editingWorkoutId).toBeNull()
  })

  it('guarda como plantilla cuando hay ejercicios y el usuario confirma', async () => {
    const { pinia, wrapper } = await mountWithPlugins(WorkoutForm)
    const workoutStore = useWorkoutStore(pinia)
    const modalStore = useModalStore(pinia)
    const toastStore = useToastStore(pinia)

    await getExposed<WorkoutFormExposed>(wrapper).startEdit(createWorkout({ id: 1, name: 'Push' }))
    workoutStore.hydrateExercises(1, [mockExercise])
    await nextTick()

    const saveTemplateLabel = i18n.global.t('workouts.form.saveAsTemplate')
    const saveButton = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes(saveTemplateLabel))
    const confirmPromise = saveButton!.trigger('click')

    await nextTick()
    modalStore.close(true)
    await confirmPromise
    await flushPromises()

    expect(templateApi.createTemplate).toHaveBeenCalled()
    expect(toastStore.toasts.some((toast) => toast.type === 'success')).toBe(true)
  })

  it('no guarda plantilla si el usuario cancela', async () => {
    const { pinia, wrapper } = await mountWithPlugins(WorkoutForm)
    const workoutStore = useWorkoutStore(pinia)
    const modalStore = useModalStore(pinia)

    await getExposed<WorkoutFormExposed>(wrapper).startEdit(createWorkout({ id: 1, name: 'Push' }))
    workoutStore.hydrateExercises(1, [mockExercise])
    await nextTick()

    const saveTemplateLabel = i18n.global.t('workouts.form.saveAsTemplate')
    const saveButton = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes(saveTemplateLabel))
    const confirmPromise = saveButton!.trigger('click')

    await nextTick()
    modalStore.close(false)
    await confirmPromise
    await flushPromises()

    expect(templateApi.createTemplate).not.toHaveBeenCalled()
  })

  it('muestra error al fallar guardar como plantilla', async () => {
    vi.mocked(templateApi.createTemplate).mockRejectedValue(new Error('Template error'))
    const { pinia, wrapper } = await mountWithPlugins(WorkoutForm)
    const workoutStore = useWorkoutStore(pinia)
    const modalStore = useModalStore(pinia)
    const toastStore = useToastStore(pinia)

    await getExposed<WorkoutFormExposed>(wrapper).startEdit(createWorkout({ id: 1, name: 'Push' }))
    workoutStore.hydrateExercises(1, [mockExercise])
    await nextTick()

    const saveTemplateLabel = i18n.global.t('workouts.form.saveAsTemplate')
    const saveButton = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes(saveTemplateLabel))
    const confirmPromise = saveButton!.trigger('click')

    await nextTick()
    modalStore.close(true)
    await confirmPromise
    await flushPromises()

    expect(toastStore.toasts.some((toast) => toast.type === 'error')).toBe(true)
  })

  it('expone resetForm y editingWorkoutId', async () => {
    const { wrapper } = await mountWithPlugins(WorkoutForm)

    await getExposed<WorkoutFormExposed>(wrapper).startEdit(createWorkout({ id: 5, name: 'Pull' }))
    expect(getExposed<WorkoutFormExposed>(wrapper).editingWorkoutId).toBe(5)

    getExposed<WorkoutFormExposed>(wrapper).resetForm()
    await nextTick()
    expect(getExposed<WorkoutFormExposed>(wrapper).editingWorkoutId).toBeNull()
  })

  it('muestra etiqueta con conteo de ejercicios en borrador', async () => {
    const { wrapper } = await mountWithPlugins(WorkoutForm)
    await flushPromises()

    await wrapper.find('#exerciseTypeId').setValue(String(mockExerciseType.id))
    await wrapper.find('#sets').setValue('3')
    await wrapper.find('#reps').setValue('10')
    await wrapper.find('#restSeconds').setValue('60')
    await wrapper.findComponent({ name: 'WorkoutExercises' }).find('form').trigger('submit.prevent')
    await flushPromises()

    await wrapper.find('#workout-name').setValue('Leg day')

    expect(wrapper.text()).toContain(
      i18n.global.t('workouts.form.createWithExercises', { count: 1 }),
    )
  })

  it('muestra estado de guardado durante actualización', async () => {
    let resolveUpdate: (value: typeof mockWorkout) => void
    vi.mocked(workoutApi.updateWorkout).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpdate = resolve
        }),
    )

    const { wrapper } = await mountWithPlugins(WorkoutForm)

    await getExposed<WorkoutFormExposed>(wrapper).startEdit(createWorkout({ id: 1, name: 'Push' }))
    await wrapper.find('#workout-name').setValue('Push updated')
    await clickFormPrimaryButton(wrapper)
    await nextTick()

    expect(wrapper.text()).toContain(i18n.global.t('common.saving'))

    resolveUpdate!(createWorkout({ id: 1, name: 'Push updated' }))
    await flushPromises()
  })

  it('carga ejercicios tras crear entrenamiento sin ejercicios inline', async () => {
    const { wrapper } = await mountWithPlugins(WorkoutForm)

    await wrapper.find('#workout-name').setValue('Leg day')
    await clickFormPrimaryButton(wrapper)
    await flushPromises()

    expect(workoutApi.getWorkoutExercises).toHaveBeenCalledWith(mockWorkout.id)
  })
})
