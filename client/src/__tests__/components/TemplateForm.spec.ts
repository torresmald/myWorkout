import { flushPromises } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { createTemplate, createTemplateExercise } from '@/__tests__/fixtures/template.fixture'
import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import * as exerciseTypeApi from '@/api/exercise-type.api'
import * as templateApi from '@/api/template.api'
import TemplateForm from '@/components/TemplateForm.vue'
import { i18n } from '@/i18n'
import { useToastStore } from '@/stores/toast.store'

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

const mockTemplate = createTemplate()
const mockExercise = createTemplateExercise()

async function clickFormPrimaryButton(wrapper: VueWrapper) {
  const actionSection = wrapper.findAll('section').at(-1)!
  const primaryButton = actionSection
    .findAll('button')
    .find((button) => button.attributes('disabled') === undefined)
  await primaryButton!.trigger('click')
}

describe('TemplateForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Element.prototype.scrollIntoView = vi.fn()
    vi.mocked(exerciseTypeApi.getExerciseTypes).mockResolvedValue([
      { id: 5, name: 'Press banca', description: null, muscleGroup: 'CHEST', catalogExerciseId: null, mediaType: null, mediaUrl: null, createdAt: '', updatedAt: '' },
    ])
    vi.mocked(templateApi.getTemplates).mockResolvedValue([mockTemplate])
    vi.mocked(templateApi.createTemplate).mockResolvedValue(mockTemplate)
    vi.mocked(templateApi.updateTemplate).mockResolvedValue(mockTemplate)
    vi.mocked(templateApi.getTemplateExercises).mockResolvedValue([mockExercise])
  })

  it('muestra formulario de nueva plantilla', async () => {
    const { wrapper } = await mountWithPlugins(TemplateForm)

    expect(wrapper.text()).toContain(i18n.global.t('templates.form.newTitle'))
  })

  it('valida nombre obligatorio al enviar el formulario', async () => {
    const { pinia, wrapper } = await mountWithPlugins(TemplateForm)
    const toastStore = useToastStore(pinia)

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(toastStore.toasts.some((toast) => toast.type === 'error')).toBe(true)
    expect(templateApi.createTemplate).not.toHaveBeenCalled()
  })

  it('crea plantilla sin ejercicios', async () => {
    const { pinia, wrapper } = await mountWithPlugins(TemplateForm)
    const toastStore = useToastStore(pinia)

    await wrapper.find('#template-name').setValue('Push day')
    await clickFormPrimaryButton(wrapper)
    await flushPromises()

    expect(templateApi.createTemplate).toHaveBeenCalled()
    expect(toastStore.toasts.some((toast) => toast.type === 'success')).toBe(true)
    expect(wrapper.text()).toContain(i18n.global.t('templates.form.editTitle'))
  })

  it('crea plantilla con ejercicios en borrador', async () => {
    vi.mocked(templateApi.createTemplate).mockResolvedValue({
      ...mockTemplate,
      exercises: [mockExercise],
    })

    const { wrapper } = await mountWithPlugins(TemplateForm)
    await flushPromises()

    await wrapper.find('#template-exerciseTypeId').setValue('5')
    await wrapper.find('#template-sets').setValue('4')
    await wrapper.find('#template-reps').setValue('8')
    await wrapper.find('#template-restSeconds').setValue('120')
    await wrapper
      .findComponent({ name: 'TemplateExercises' })
      .find('form')
      .trigger('submit.prevent')
    await flushPromises()

    await wrapper.find('#template-name').setValue('Push day')
    await clickFormPrimaryButton(wrapper)
    await flushPromises()

    expect(templateApi.createTemplate).toHaveBeenCalledWith(
      expect.objectContaining({ exercises: expect.any(Array) }),
    )
  })

  it('actualiza plantilla en modo edición', async () => {
    const { wrapper } = await mountWithPlugins(TemplateForm)

    await wrapper.vm.startEdit(createTemplate({ id: 1, name: 'Push', description: 'Desc' }))
    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('templates.form.editingHint'))
    await wrapper.find('#template-name').setValue('Push updated')
    await clickFormPrimaryButton(wrapper)
    await flushPromises()

    expect(templateApi.updateTemplate).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ name: 'Push updated' }),
    )
  })

  it('muestra error al fallar creación', async () => {
    vi.mocked(templateApi.createTemplate).mockRejectedValue(new Error('Create failed'))
    const { pinia, wrapper } = await mountWithPlugins(TemplateForm)
    const toastStore = useToastStore(pinia)

    await wrapper.find('#template-name').setValue('Push day')
    await clickFormPrimaryButton(wrapper)
    await flushPromises()

    expect(toastStore.toasts.some((toast) => toast.type === 'error')).toBe(true)
  })

  it('muestra error al fallar actualización', async () => {
    vi.mocked(templateApi.updateTemplate).mockRejectedValue(new Error('Update failed'))
    const { pinia, wrapper } = await mountWithPlugins(TemplateForm)
    const toastStore = useToastStore(pinia)

    await wrapper.vm.startEdit(createTemplate({ id: 1, name: 'Push' }))
    await wrapper.find('#template-name').setValue('Push updated')
    await clickFormPrimaryButton(wrapper)
    await flushPromises()

    expect(toastStore.toasts.some((toast) => toast.type === 'error')).toBe(true)
  })

  it('reinicia formulario al crear nueva plantilla', async () => {
    const { wrapper } = await mountWithPlugins(TemplateForm)

    await wrapper.vm.startEdit(createTemplate({ id: 1, name: 'Push' }))
    const newLabel = i18n.global.t('templates.form.newTemplateButton')
    const newButton = wrapper.findAll('button').find((btn) => btn.text().includes(newLabel))
    await newButton!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('templates.form.newTitle'))
    expect(wrapper.vm.editingTemplateId).toBeNull()
  })

  it('expone resetForm y editingTemplateId', async () => {
    const { wrapper } = await mountWithPlugins(TemplateForm)

    await wrapper.vm.startEdit(createTemplate({ id: 3, name: 'Legs' }))
    expect(wrapper.vm.editingTemplateId).toBe(3)

    wrapper.vm.resetForm()
    await nextTick()
    expect(wrapper.vm.editingTemplateId).toBeNull()
  })

  it('muestra etiqueta con conteo de ejercicios en borrador', async () => {
    const { wrapper } = await mountWithPlugins(TemplateForm)
    await flushPromises()

    await wrapper.find('#template-exerciseTypeId').setValue('5')
    await wrapper.find('#template-sets').setValue('4')
    await wrapper.find('#template-reps').setValue('8')
    await wrapper.find('#template-restSeconds').setValue('120')
    await wrapper
      .findComponent({ name: 'TemplateExercises' })
      .find('form')
      .trigger('submit.prevent')
    await flushPromises()

    await wrapper.find('#template-name').setValue('Push day')

    expect(wrapper.text()).toContain(
      i18n.global.t('templates.form.createWithExercises', { count: 1 }),
    )
  })

  it('carga ejercicios tras crear plantilla sin ejercicios inline', async () => {
    const { wrapper } = await mountWithPlugins(TemplateForm)

    await wrapper.find('#template-name').setValue('Push day')
    await clickFormPrimaryButton(wrapper)
    await flushPromises()

    expect(templateApi.getTemplateExercises).toHaveBeenCalledWith(mockTemplate.id)
  })
})
