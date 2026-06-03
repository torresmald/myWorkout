import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import * as adminApi from '@/api/admin.api'
import AdminCatalogView from '@/views/AdminCatalogView.vue'
import { i18n } from '@/i18n'
import { useModalStore } from '@/stores/modal.store'
import { useToastStore } from '@/stores/toast.store'
import type { AdminExerciseCatalogEntry } from '@/interfaces/admin-exercise-catalog.interface'

vi.mock('@/api/admin.api', () => ({
  getExerciseCatalog: vi.fn(),
  createExerciseCatalogEntry: vi.fn(),
  updateExerciseCatalogEntry: vi.fn(),
  deleteExerciseCatalogEntry: vi.fn(),
  uploadCatalogMedia: vi.fn(),
}))

const mockEntry: AdminExerciseCatalogEntry = {
  id: 1,
  slug: 'bench-press',
  nameEs: 'Press de banca',
  nameEn: 'Bench press',
  descriptionEs: null,
  descriptionEn: null,
  muscleGroup: 'CHEST',
  mediaType: 'GIF',
  mediaUrl: 'https://example.com/bench.gif',
  sortOrder: 0,
  active: true,
  importCount: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('AdminCatalogView', () => {
  beforeEach(() => {
    vi.mocked(adminApi.getExerciseCatalog).mockResolvedValue([mockEntry])
    vi.mocked(adminApi.createExerciseCatalogEntry).mockResolvedValue(mockEntry)
    vi.mocked(adminApi.updateExerciseCatalogEntry).mockResolvedValue(mockEntry)
    vi.mocked(adminApi.deleteExerciseCatalogEntry).mockResolvedValue({
      ...mockEntry,
      active: false,
    })
  })

  it('lista entradas del catálogo', async () => {
    const { wrapper } = await mountWithPlugins(AdminCatalogView)
    await flushPromises()

    expect(wrapper.text()).toContain('Press de banca')
    expect(wrapper.text()).toContain('Bench press')
  })

  it('crea entrada del catálogo', async () => {
    const { pinia, wrapper } = await mountWithPlugins(AdminCatalogView)
    const toastStore = useToastStore(pinia)
    const successSpy = vi.spyOn(toastStore, 'success')

    await flushPromises()

    await wrapper.find('#catalog-slug').setValue('squat')
    await wrapper.find('#catalog-name-es').setValue('Sentadilla')
    await wrapper.find('#catalog-name-en').setValue('Squat')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(adminApi.createExerciseCatalogEntry).toHaveBeenCalled()
    expect(successSpy).toHaveBeenCalledWith(i18n.global.t('admin.catalog.createSuccess'))
  })

  it('edita entrada existente', async () => {
    const { pinia, wrapper } = await mountWithPlugins(AdminCatalogView)
    const toastStore = useToastStore(pinia)
    const successSpy = vi.spyOn(toastStore, 'success')

    await flushPromises()

    const editButton = wrapper.findAll('button').find((b) =>
      b.text().includes(i18n.global.t('common.edit')),
    )
    await editButton!.trigger('click')
    await flushPromises()

    await wrapper.find('#catalog-name-es').setValue('Press inclinado')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(adminApi.updateExerciseCatalogEntry).toHaveBeenCalled()
    expect(successSpy).toHaveBeenCalledWith(i18n.global.t('admin.catalog.updateSuccess'))
  })

  it('elimina entrada tras confirmación', async () => {
    const { pinia, wrapper } = await mountWithPlugins(AdminCatalogView)
    const modalStore = useModalStore(pinia)
    vi.spyOn(modalStore, 'confirm').mockResolvedValue(true)

    await flushPromises()

    const deleteButton = wrapper.findAll('button').find((b) =>
      b.text().includes(i18n.global.t('common.delete')),
    )
    await deleteButton!.trigger('click')
    await flushPromises()

    expect(adminApi.deleteExerciseCatalogEntry).toHaveBeenCalledWith(1)
  })

  it('sube archivo de media válido', async () => {
    vi.mocked(adminApi.uploadCatalogMedia).mockResolvedValue({
      mediaUrl: 'https://example.com/new.gif',
      mediaType: 'GIF',
    })

    const { pinia, wrapper } = await mountWithPlugins(AdminCatalogView)
    const toastStore = useToastStore(pinia)
    const successSpy = vi.spyOn(toastStore, 'success')

    await flushPromises()

    const file = new File(['gif'], 'move.gif', { type: 'image/gif' })
    const input = wrapper.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('change')
    await flushPromises()

    expect(adminApi.uploadCatalogMedia).toHaveBeenCalled()
    expect(successSpy).toHaveBeenCalledWith(i18n.global.t('admin.catalog.media.uploadSuccess'))
  })
})
