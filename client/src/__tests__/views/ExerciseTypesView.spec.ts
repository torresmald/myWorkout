import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createExerciseType } from '@/__tests__/fixtures/exercise-type.fixture'
import { exerciseTypeRoutes } from '@/__tests__/helpers/test-routes'
import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import * as exerciseTypeApi from '@/api/exercise-type.api'
import * as personalRecordApi from '@/api/personal-record.api'
import ExerciseTypesView from '@/views/ExerciseTypesView.vue'
import { i18n } from '@/i18n'
import { useModalStore } from '@/stores/modal.store'
import { useToastStore } from '@/stores/toast.store'

vi.mock('@/api/exercise-type.api', () => ({
  getExerciseTypes: vi.fn(),
  createExerciseType: vi.fn(),
  updateExerciseType: vi.fn(),
  deleteExerciseType: vi.fn(),
}))

vi.mock('@/api/personal-record.api', () => ({
  getPersonalRecords: vi.fn(),
}))

describe('ExerciseTypesView', () => {
  beforeEach(() => {
    vi.mocked(exerciseTypeApi.getExerciseTypes).mockResolvedValue([
      createExerciseType({ id: 1, name: 'Press banca' }),
    ])
    vi.mocked(personalRecordApi.getPersonalRecords).mockResolvedValue([])
    vi.mocked(exerciseTypeApi.createExerciseType).mockResolvedValue(
      createExerciseType({ id: 2, name: 'Nuevo' }),
    )
    vi.mocked(exerciseTypeApi.updateExerciseType).mockResolvedValue(
      createExerciseType({ id: 1, name: 'Actualizado' }),
    )
    vi.mocked(exerciseTypeApi.deleteExerciseType).mockResolvedValue(undefined)
  })

  it('lista tipos de ejercicio', async () => {
    const { wrapper } = await mountWithPlugins(ExerciseTypesView)
    await flushPromises()

    expect(wrapper.text()).toContain('Press banca')
  })

  it('crea un tipo de ejercicio', async () => {
    const { pinia, wrapper } = await mountWithPlugins(ExerciseTypesView)
    const toastStore = useToastStore(pinia)
    const successSpy = vi.spyOn(toastStore, 'success')

    await flushPromises()
    await wrapper.find('#name').setValue('Nuevo ejercicio')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(exerciseTypeApi.createExerciseType).toHaveBeenCalled()
    expect(successSpy).toHaveBeenCalledWith(i18n.global.t('exerciseTypes.createSuccess'))
  })

  it('edita un tipo de ejercicio', async () => {
    const { pinia, wrapper } = await mountWithPlugins(ExerciseTypesView)
    const toastStore = useToastStore(pinia)
    const successSpy = vi.spyOn(toastStore, 'success')

    await flushPromises()

    const actions = wrapper.findComponent({ name: 'ListItemIconActions' })
    actions.vm.$emit('edit')
    await flushPromises()

    await wrapper.find('#name').setValue('Actualizado')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(exerciseTypeApi.updateExerciseType).toHaveBeenCalled()
    expect(successSpy).toHaveBeenCalledWith(i18n.global.t('exerciseTypes.updateSuccess'))
  })

  it('elimina tipo de ejercicio tras confirmación', async () => {
    const { pinia, wrapper } = await mountWithPlugins(ExerciseTypesView)
    const modalStore = useModalStore(pinia)
    vi.spyOn(modalStore, 'confirm').mockResolvedValue(true)

    await flushPromises()

    const actions = wrapper.findComponent({ name: 'ListItemIconActions' })
    actions.vm.$emit('delete')
    await flushPromises()

    expect(exerciseTypeApi.deleteExerciseType).toHaveBeenCalledWith(1)
  })

  it('navega al historial del ejercicio', async () => {
    const { router, wrapper } = await mountWithPlugins(ExerciseTypesView, {
      routes: exerciseTypeRoutes,
      initialRoute: '/exercise-types',
    })

    await flushPromises()

    const historyButton = wrapper.find(
      `[aria-label="${i18n.global.t('exerciseHistory.viewHistory')}"]`,
    )
    await historyButton.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('exercise-history')
  })
})
