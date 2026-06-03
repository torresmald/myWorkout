import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'

import ExerciseTechniqueModal from '@/components/exercise/ExerciseTechniqueModal.vue'
import { i18n } from '@/i18n'

function mountTechniqueModal(props: {
  open?: boolean
  exerciseName?: string
  description?: string | null
  mediaType?: string | null
  mediaUrl?: string | null
}): VueWrapper {
  return mount(ExerciseTechniqueModal, {
    props: {
      open: true,
      exerciseName: 'Press de banca',
      description: 'Baja la barra al pecho.',
      mediaType: 'GIF',
      mediaUrl: 'https://example.com/bench-press.gif',
      ...props,
    },
    global: {
      plugins: [i18n],
    },
    attachTo: document.body,
  })
}

describe('ExerciseTechniqueModal', () => {
  let wrapper: VueWrapper | undefined

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    document.body.innerHTML = ''
  })

  it('muestra nombre, descripción y GIF cuando hay media de tipo GIF', () => {
    wrapper = mountTechniqueModal({})

    const dialog = document.body.querySelector('[role="dialog"]')

    expect(dialog?.textContent).toContain('Press de banca')
    expect(dialog?.textContent).toContain('Baja la barra al pecho.')
    expect(document.body.querySelector('img')?.getAttribute('src')).toBe(
      'https://example.com/bench-press.gif',
    )
  })

  it('muestra imagen cuando el tipo es IMAGE', () => {
    wrapper = mountTechniqueModal({
      mediaType: 'IMAGE',
      mediaUrl: 'https://example.com/bench.jpg',
    })

    expect(document.body.querySelector('img')?.getAttribute('src')).toBe(
      'https://example.com/bench.jpg',
    )
  })

  it('muestra video cuando el tipo es VIDEO', () => {
    wrapper = mountTechniqueModal({
      mediaType: 'VIDEO',
      mediaUrl: 'https://example.com/bench.mp4',
    })

    const video = document.body.querySelector('video')
    expect(video?.getAttribute('src')).toBe('https://example.com/bench.mp4')
  })

  it('muestra iframe de YouTube con URL embebida válida', () => {
    wrapper = mountTechniqueModal({
      mediaType: 'YOUTUBE',
      mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    })

    const iframe = document.body.querySelector('iframe')
    expect(iframe?.getAttribute('src')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')
  })

  it('soporta URLs cortas de YouTube', () => {
    wrapper = mountTechniqueModal({
      mediaType: 'YOUTUBE',
      mediaUrl: 'https://youtu.be/dQw4w9WgXcQ',
    })

    const iframe = document.body.querySelector('iframe')
    expect(iframe?.getAttribute('src')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')
  })

  it('muestra mensaje de sin media cuando no hay URL', () => {
    wrapper = mountTechniqueModal({
      description: null,
      mediaType: null,
      mediaUrl: null,
    })

    const dialog = document.body.querySelector('[role="dialog"]')

    expect(dialog?.textContent).toContain(i18n.global.t('exerciseCatalog.noMedia'))
    expect(document.body.querySelector('img')).toBeNull()
  })

  it('muestra sin media cuando YouTube no tiene ID válido', () => {
    wrapper = mountTechniqueModal({
      mediaType: 'YOUTUBE',
      mediaUrl: 'https://example.com/not-youtube',
    })

    const dialog = document.body.querySelector('[role="dialog"]')
    expect(dialog?.textContent).toContain(i18n.global.t('exerciseCatalog.noMedia'))
    expect(document.body.querySelector('iframe')).toBeNull()
  })

  it('muestra sin media cuando el tipo YouTube no tiene URL', () => {
    wrapper = mountTechniqueModal({
      mediaType: 'YOUTUBE',
      mediaUrl: null,
    })

    const dialog = document.body.querySelector('[role="dialog"]')
    expect(dialog?.textContent).toContain(i18n.global.t('exerciseCatalog.noMedia'))
  })

  it('emite close al pulsar Escape', async () => {
    wrapper = mountTechniqueModal({})

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
