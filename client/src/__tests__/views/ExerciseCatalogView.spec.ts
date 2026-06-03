import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { createCatalogExercise } from '@/__tests__/fixtures/catalog-exercise.fixture'
import { mountWithPlugins, setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import { catalogRoutes } from '@/__tests__/helpers/test-routes'
import * as exerciseCatalogApi from '@/api/exercise-catalog.api'
import * as exerciseTypeApi from '@/api/exercise-type.api'
import { i18n } from '@/i18n'
import { useExerciseCatalogStore } from '@/stores/exercise-catalog.store'
import { useLocaleStore } from '@/stores/locale.store'
import { useToastStore } from '@/stores/toast.store'
import ExerciseCatalogView from '@/views/ExerciseCatalogView.vue'

vi.mock('@/api/exercise-catalog.api', () => ({
  getExerciseCatalog: vi.fn(),
  importExerciseFromCatalog: vi.fn(),
}))

vi.mock('@/api/exercise-type.api', () => ({
  getExerciseTypes: vi.fn(),
  createExerciseType: vi.fn(),
  updateExerciseType: vi.fn(),
  deleteExerciseType: vi.fn(),
}))

describe('ExerciseCatalogView - localización en vivo', () => {
  beforeEach(() => {
    vi.mocked(exerciseCatalogApi.getExerciseCatalog).mockResolvedValue([createCatalogExercise()])
  })

  it('actualiza nombre y descripción al cambiar el locale sin recargar', async () => {
    const { pinia, wrapper } = await mountWithPlugins(ExerciseCatalogView, {
      routes: catalogRoutes,
      initialRoute: '/exercise-catalog',
    })
    const localeStore = useLocaleStore(pinia)

    localeStore.setLocale('es')
    await flushPromises()

    expect(wrapper.text()).toContain('Press de banca')
    expect(wrapper.text()).toContain('Baja la barra al pecho y empuja hacia arriba.')

    localeStore.setLocale('en')
    await nextTick()

    expect(wrapper.text()).toContain('Bench press')
    expect(wrapper.text()).toContain('Lower the bar to your chest and press up.')
    expect(wrapper.text()).not.toContain('Press de banca')
  })
})

describe('ExerciseCatalogView - ver técnica', () => {
  beforeEach(() => {
    vi.mocked(exerciseCatalogApi.getExerciseCatalog).mockResolvedValue([createCatalogExercise()])
  })

  it('abre el modal de técnica con la descripción del ejercicio', async () => {
    const { pinia, wrapper } = await mountWithPlugins(ExerciseCatalogView, {
      routes: catalogRoutes,
      initialRoute: '/exercise-catalog',
    })
    const localeStore = useLocaleStore(pinia)

    localeStore.setLocale('es')
    await flushPromises()

    const viewTechniqueLabel = i18n.global.t('exerciseCatalog.viewTechnique')
    const viewTechniqueButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes(viewTechniqueLabel))

    expect(viewTechniqueButton).toBeDefined()
    await viewTechniqueButton!.trigger('click')
    await nextTick()

    const dialog = document.body.querySelector('[role="dialog"]')

    expect(dialog).not.toBeNull()
    expect(dialog?.textContent).toContain('Press de banca')
    expect(dialog?.textContent).toContain('Baja la barra al pecho y empuja hacia arriba.')
  })
})

describe('ExerciseCatalogView - filtros e importación', () => {
  beforeEach(() => {
    vi.mocked(exerciseCatalogApi.getExerciseCatalog).mockResolvedValue([createCatalogExercise()])
    vi.mocked(exerciseCatalogApi.importExerciseFromCatalog).mockResolvedValue(undefined)
    vi.mocked(exerciseTypeApi.getExerciseTypes).mockResolvedValue([])
  })

  it('muestra estado vacío sin ejercicios', async () => {
    vi.mocked(exerciseCatalogApi.getExerciseCatalog).mockResolvedValue([])

    const { wrapper } = await mountWithPlugins(ExerciseCatalogView, {
      routes: catalogRoutes,
      initialRoute: '/exercise-catalog',
    })
    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('exerciseCatalog.empty'))
  })

  it('filtra por grupo muscular', async () => {
    const { pinia, wrapper } = await mountWithPlugins(ExerciseCatalogView, {
      routes: catalogRoutes,
      initialRoute: '/exercise-catalog',
    })
    const catalogStore = useExerciseCatalogStore(pinia)

    await flushPromises()

    const chestLabel = i18n.global.t('exerciseCatalog.muscleGroups.CHEST')
    const filterButton = wrapper.findAll('button').find((b) => b.text() === chestLabel)
    await filterButton!.trigger('click')
    await flushPromises()

    expect(exerciseCatalogApi.getExerciseCatalog).toHaveBeenCalledWith('CHEST')
    expect(catalogStore.exercises).toHaveLength(1)
  })

  it('importa ejercicio del catálogo', async () => {
    const pinia = setupTestPinia()
    const toastStore = useToastStore(pinia)
    const successSpy = vi.spyOn(toastStore, 'success')

    const { wrapper } = await mountWithPlugins(ExerciseCatalogView, {
      pinia,
      routes: catalogRoutes,
      initialRoute: '/exercise-catalog',
    })

    await flushPromises()

    const importButton = wrapper.findAll('button').find((b) =>
      b.text().includes(i18n.global.t('exerciseCatalog.importButton')),
    )
    await importButton!.trigger('click')
    await flushPromises()
    await flushPromises()

    expect(exerciseCatalogApi.importExerciseFromCatalog).toHaveBeenCalledWith(1)
    expect(successSpy).toHaveBeenCalled()
  })

  it('muestra ejercicio sin media', async () => {
    vi.mocked(exerciseCatalogApi.getExerciseCatalog).mockResolvedValue([
      createCatalogExercise({ mediaUrl: null, mediaType: null }),
    ])

    const { wrapper } = await mountWithPlugins(ExerciseCatalogView, {
      routes: catalogRoutes,
      initialRoute: '/exercise-catalog',
    })
    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('exerciseCatalog.noMedia'))
  })

  it('muestra error si falla la carga', async () => {
    vi.mocked(exerciseCatalogApi.getExerciseCatalog).mockRejectedValue(new Error('fail'))

    const pinia = setupTestPinia()
    const toastStore = useToastStore(pinia)
    const errorSpy = vi.spyOn(toastStore, 'error')

    await mountWithPlugins(ExerciseCatalogView, {
      pinia,
      routes: catalogRoutes,
      initialRoute: '/exercise-catalog',
    })

    await flushPromises()

    expect(errorSpy).toHaveBeenCalled()
  })
})
