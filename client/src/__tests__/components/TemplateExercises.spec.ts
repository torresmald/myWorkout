import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { createExerciseType } from '@/__tests__/fixtures/exercise-type.fixture'
import { createTemplateExercise } from '@/__tests__/fixtures/template.fixture'
import { getExposed } from '@/__tests__/helpers/component-vm'
import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import * as exerciseTypeApi from '@/api/exercise-type.api'
import * as templateApi from '@/api/template.api'
import TemplateExercises from '@/components/TemplateExercises.vue'
import { i18n } from '@/i18n'
import { useModalStore } from '@/stores/modal.store'
import { useToastStore } from '@/stores/toast.store'
import { useTemplateStore } from '@/stores/template.store'

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
  createExerciseType: vi.fn(),
  updateExerciseType: vi.fn(),
  deleteExerciseType: vi.fn(),
}))

vi.mock('@/utils/rest-timer-sound.util', () => ({
  unlockRestTimerSound: vi.fn(),
  playRestTimerCompleteSound: vi.fn(),
}))

const mockExerciseType = createExerciseType({ id: 5, name: 'Press banca', muscleGroup: 'CHEST' })
const mockExercise = createTemplateExercise()

async function fillExerciseForm(wrapper: Awaited<ReturnType<typeof mountWithPlugins>>['wrapper']) {
  await wrapper.find('#template-exerciseTypeId').setValue(String(mockExerciseType.id))
  await wrapper.find('#template-sets').setValue('4')
  await wrapper.find('#template-reps').setValue('8')
  await wrapper.find('#template-restSeconds').setValue('120')
  await wrapper.find('#template-weight').setValue('60')
}

describe('TemplateExercises', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(exerciseTypeApi.getExerciseTypes).mockResolvedValue([mockExerciseType])
    vi.mocked(templateApi.getTemplateExercises).mockResolvedValue([mockExercise])
    vi.mocked(templateApi.createTemplateExercise).mockResolvedValue(mockExercise)
    vi.mocked(templateApi.updateTemplateExercise).mockResolvedValue(mockExercise)
  })

  describe('modo borrador', () => {
    it('muestra título de borrador y estado vacío', async () => {
      const { wrapper } = await mountWithPlugins(TemplateExercises)
      await flushPromises()

      expect(wrapper.text()).toContain(i18n.global.t('templates.exercises.draftTitle'))
      expect(wrapper.text()).toContain(i18n.global.t('empty.templates.exercises.title'))
    })

    it('añade ejercicio al borrador', async () => {
      const { pinia, wrapper } = await mountWithPlugins(TemplateExercises)
      const toastStore = useToastStore(pinia)
      await flushPromises()

      await fillExerciseForm(wrapper)
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(wrapper.text()).toContain('Press banca')
      expect(toastStore.toasts.some((t) => t.type === 'success')).toBe(true)
    })

    it('edita y elimina ejercicio en borrador', async () => {
      const { pinia, wrapper } = await mountWithPlugins(TemplateExercises)
      await flushPromises()

      await fillExerciseForm(wrapper)
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(wrapper.findAll('li.stagger-item').length).toBe(1)

      const actions = wrapper.findComponent({ name: 'ListItemIconActions' })
      actions.vm.$emit('edit')
      await nextTick()

      await wrapper.find('#template-reps').setValue('10')
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(wrapper.text()).toContain('10')

      const modalStore = useModalStore(pinia)
      actions.vm.$emit('delete')
      await nextTick()
      modalStore.close(true)
      await flushPromises()

      expect(wrapper.findAll('li.stagger-item').length).toBe(0)
    })

    it('cancela edición en borrador', async () => {
      const { wrapper } = await mountWithPlugins(TemplateExercises)
      await flushPromises()

      await fillExerciseForm(wrapper)
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      wrapper.findComponent({ name: 'ListItemIconActions' }).vm.$emit('edit')
      await nextTick()

      const cancelLabel = i18n.global.t('common.cancel')
      const cancelButton = wrapper.findAll('button').find((btn) => btn.text().includes(cancelLabel))
      await cancelButton!.trigger('click')

      expect(wrapper.text()).toContain(i18n.global.t('templates.exercises.addTitle'))
    })

    it('no elimina borrador si el usuario cancela', async () => {
      const { pinia, wrapper } = await mountWithPlugins(TemplateExercises)
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

    it('resetea formulario al eliminar borrador en edición', async () => {
      const { pinia, wrapper } = await mountWithPlugins(TemplateExercises)
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

      expect(wrapper.text()).toContain(i18n.global.t('templates.exercises.addTitle'))
    })

    it('inicia temporizador en borrador', async () => {
      const { wrapper } = await mountWithPlugins(TemplateExercises)
      await flushPromises()

      await fillExerciseForm(wrapper)
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      wrapper.findComponent({ name: 'ListItemIconActions' }).vm.$emit('timer')
      await nextTick()

      expect(wrapper.findComponent({ name: 'RestTimerModal' }).props('open')).toBe(true)
    })
  })

  describe('modo persistido', () => {
    it('carga ejercicios de la plantilla', async () => {
      const { wrapper } = await mountWithPlugins(TemplateExercises)
      await wrapper.setProps({ templateId: 1 })
      await flushPromises()

      expect(templateApi.getTemplateExercises).toHaveBeenCalledWith(1)
      expect(wrapper.text()).toContain('Press banca')
    })

    it('reutiliza ejercicios en caché', async () => {
      const { pinia, wrapper } = await mountWithPlugins(TemplateExercises)
      const templateStore = useTemplateStore(pinia)
      templateStore.hydrateExercises(1, [mockExercise])

      await wrapper.setProps({ templateId: 1 })
      await flushPromises()

      expect(templateApi.getTemplateExercises).not.toHaveBeenCalled()
    })

    it('crea ejercicio persistido', async () => {
      const { pinia, wrapper } = await mountWithPlugins(TemplateExercises)
      const toastStore = useToastStore(pinia)

      await wrapper.setProps({ templateId: 1 })
      await flushPromises()
      await fillExerciseForm(wrapper)
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(templateApi.createTemplateExercise).toHaveBeenCalled()
      expect(toastStore.toasts.some((t) => t.type === 'success')).toBe(true)
    })

    it('actualiza ejercicio persistido', async () => {
      const { wrapper } = await mountWithPlugins(TemplateExercises)

      await wrapper.setProps({ templateId: 1 })
      await flushPromises()

      wrapper.findComponent({ name: 'ListItemIconActions' }).vm.$emit('edit')
      await nextTick()
      await wrapper.find('#template-reps').setValue('12')
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(templateApi.updateTemplateExercise).toHaveBeenCalled()
    })

    it('elimina ejercicio persistido tras confirmar', async () => {
      const { pinia, wrapper } = await mountWithPlugins(TemplateExercises)
      const modalStore = useModalStore(pinia)
      vi.mocked(templateApi.deleteTemplateExercise).mockResolvedValue(createTemplateExercise())

      await wrapper.setProps({ templateId: 1 })
      await flushPromises()

      wrapper.findComponent({ name: 'ListItemIconActions' }).vm.$emit('delete')
      await nextTick()
      modalStore.close(true)
      await flushPromises()

      expect(templateApi.deleteTemplateExercise).toHaveBeenCalled()
    })

    it('no elimina ejercicio persistido si el usuario cancela', async () => {
      const { pinia, wrapper } = await mountWithPlugins(TemplateExercises)
      const modalStore = useModalStore(pinia)

      await wrapper.setProps({ templateId: 1 })
      await flushPromises()

      wrapper.findComponent({ name: 'ListItemIconActions' }).vm.$emit('delete')
      await nextTick()
      modalStore.close(false)
      await flushPromises()

      expect(wrapper.findAll('li.stagger-item').length).toBe(1)
    })

    it('resetea formulario al eliminar ejercicio en edición', async () => {
      const { pinia, wrapper } = await mountWithPlugins(TemplateExercises)
      const modalStore = useModalStore(pinia)
      vi.mocked(templateApi.deleteTemplateExercise).mockResolvedValue(createTemplateExercise())

      await wrapper.setProps({ templateId: 1 })
      await flushPromises()

      wrapper.findComponent({ name: 'ListItemIconActions' }).vm.$emit('edit')
      await nextTick()

      wrapper.findComponent({ name: 'ListItemIconActions' }).vm.$emit('delete')
      await nextTick()
      modalStore.close(true)
      await flushPromises()

      expect(wrapper.text()).toContain(i18n.global.t('templates.exercises.addTitle'))
    })

    it('muestra error al fallar actualización de ejercicio', async () => {
      vi.mocked(templateApi.updateTemplateExercise).mockRejectedValue(new Error('Update failed'))
      const { pinia, wrapper } = await mountWithPlugins(TemplateExercises)
      const toastStore = useToastStore(pinia)

      await wrapper.setProps({ templateId: 1 })
      await flushPromises()

      wrapper.findComponent({ name: 'ListItemIconActions' }).vm.$emit('edit')
      await nextTick()
      await wrapper.find('#template-reps').setValue('12')
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(toastStore.toasts.some((toast) => toast.type === 'error')).toBe(true)
    })

    it('muestra error al fallar carga', async () => {
      vi.mocked(templateApi.getTemplateExercises).mockRejectedValue(new Error('Load failed'))
      const { pinia, wrapper } = await mountWithPlugins(TemplateExercises)
      const toastStore = useToastStore(pinia)

      await wrapper.setProps({ templateId: 1 })
      await flushPromises()

      expect(toastStore.toasts.some((t) => t.type === 'error')).toBe(true)
    })

    it('muestra error al fallar creación', async () => {
      vi.mocked(templateApi.createTemplateExercise).mockRejectedValue(new Error('Create failed'))
      const { pinia, wrapper } = await mountWithPlugins(TemplateExercises)
      const toastStore = useToastStore(pinia)

      await wrapper.setProps({ templateId: 1 })
      await flushPromises()
      await fillExerciseForm(wrapper)
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(toastStore.toasts.some((t) => t.type === 'error')).toBe(true)
    })

    it('muestra error al fallar eliminación', async () => {
      vi.mocked(templateApi.deleteTemplateExercise).mockRejectedValue(new Error('Delete failed'))
      const { pinia, wrapper } = await mountWithPlugins(TemplateExercises)
      const modalStore = useModalStore(pinia)
      const toastStore = useToastStore(pinia)

      await wrapper.setProps({ templateId: 1 })
      await flushPromises()

      wrapper.findComponent({ name: 'ListItemIconActions' }).vm.$emit('delete')
      await nextTick()
      modalStore.close(true)
      await flushPromises()

      expect(toastStore.toasts.some((t) => t.type === 'error')).toBe(true)
    })
  })

  it('muestra aviso sin tipos de ejercicio', async () => {
    vi.mocked(exerciseTypeApi.getExerciseTypes).mockResolvedValue([])
    const { wrapper } = await mountWithPlugins(TemplateExercises)
    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('templates.exercises.noTypesWarning'))
  })

  it('muestra error al fallar carga de tipos', async () => {
    vi.mocked(exerciseTypeApi.getExerciseTypes).mockRejectedValue(new Error('Types failed'))
    const { pinia, wrapper } = await mountWithPlugins(TemplateExercises)
    const toastStore = useToastStore(pinia)
    await flushPromises()

    expect(toastStore.toasts.some((t) => t.type === 'error')).toBe(true)
  })

  it('resetea al volver a modo borrador', async () => {
    const { wrapper } = await mountWithPlugins(TemplateExercises)

    await wrapper.setProps({ templateId: 1 })
    await flushPromises()
    wrapper.findComponent({ name: 'ListItemIconActions' }).vm.$emit('edit')
    await nextTick()

    await wrapper.setProps({ templateId: undefined })
    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('templates.exercises.addTitle'))
  })

  it('expone resetForm', async () => {
    const { wrapper } = await mountWithPlugins(TemplateExercises)
    await flushPromises()

    getExposed<{ resetForm: () => void }>(wrapper).resetForm()
    expect(wrapper.text()).toContain(i18n.global.t('templates.exercises.addTitle'))
  })
})
