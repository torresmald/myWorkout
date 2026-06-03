import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { createTemplate } from '@/__tests__/fixtures/template.fixture'
import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import MyTemplates from '@/components/MyTemplates.vue'
import { i18n } from '@/i18n'
import type { WorkoutTemplatePublic } from '@/interfaces/template.interface'

const defaultProps = {
  templates: [] as WorkoutTemplatePublic[],
  loading: false,
  editingTemplateId: null as number | null,
  deletingTemplateId: null as number | null,
  startingTemplateId: null as number | null,
}

async function mountMyTemplates(props: Partial<typeof defaultProps> = {}) {
  return mountWithPlugins(MyTemplates, {
    props: { ...defaultProps, ...props },
  })
}

describe('MyTemplates', () => {
  it('muestra skeleton mientras carga', async () => {
    const { wrapper } = await mountMyTemplates({ loading: true })

    expect(wrapper.findComponent({ name: 'SkeletonList' }).exists()).toBe(true)
  })

  it('muestra estado vacío cuando no hay plantillas', async () => {
    const { wrapper } = await mountMyTemplates()

    expect(wrapper.text()).toContain(i18n.global.t('empty.templates.title'))
  })

  it('renderiza plantillas con descripción y fecha', async () => {
    const templates = [
      createTemplate({ id: 1, name: 'Push day', description: 'Pecho y tríceps' }),
    ]

    const { wrapper } = await mountMyTemplates({ templates })

    expect(wrapper.text()).toContain('Push day')
    expect(wrapper.text()).toContain('Pecho y tríceps')
  })

  it('resalta la plantilla en edición', async () => {
    const templates = [createTemplate({ id: 1 })]

    const { wrapper } = await mountMyTemplates({ templates, editingTemplateId: 1 })

    expect(wrapper.find('li').classes()).toContain('bg-nav-active-bg')
  })

  it('emite start, edit y delete al interactuar', async () => {
    const template = createTemplate({ id: 1, name: 'Push day' })

    const { wrapper } = await mountMyTemplates({ templates: [template] })

    const startButton = wrapper.find(
      `[aria-label="${i18n.global.t('templates.list.startWorkout')}"]`,
    )
    await startButton.trigger('click')
    expect(wrapper.emitted('start')?.[0]).toEqual([template])

    const actions = wrapper.findComponent({ name: 'ListItemIconActions' })
    actions.vm.$emit('edit')
    actions.vm.$emit('delete')
    await flushPromises()

    expect(wrapper.emitted('edit')?.[0]).toEqual([template])
    expect(wrapper.emitted('delete')?.[0]).toEqual([template])
  })

  it('muestra spinner al iniciar entrenamiento desde plantilla', async () => {
    const templates = [createTemplate({ id: 1 })]

    const { wrapper } = await mountMyTemplates({ templates, startingTemplateId: 1 })

    expect(wrapper.findComponent({ name: 'LoadingSpinner' }).exists()).toBe(true)
  })
})
