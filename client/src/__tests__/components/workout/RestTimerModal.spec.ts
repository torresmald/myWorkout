import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import RestTimerModal from '@/components/workout/RestTimerModal.vue'
import { i18n } from '@/i18n'

describe('RestTimerModal', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  it('muestra cuenta atrás y nombre del ejercicio', async () => {
    await mountWithPlugins(RestTimerModal, {
      props: {
        open: true,
        exerciseName: 'Press banca',
        remainingSeconds: 65,
        totalSeconds: 90,
        isPaused: false,
        isFinished: false,
      },
      attachTo: document.body,
    })
    await nextTick()

    const dialog = document.body.querySelector('[role="dialog"]')
    expect(dialog?.textContent).toContain('Press banca')
    expect(dialog?.textContent).toContain('1:05')
  })

  it('emite cancel al pulsar cerrar durante descanso', async () => {
    const { wrapper } = await mountWithPlugins(RestTimerModal, {
      props: {
        open: true,
        exerciseName: 'Press banca',
        remainingSeconds: 30,
        totalSeconds: 90,
        isPaused: false,
        isFinished: false,
      },
      attachTo: document.body,
    })
    await nextTick()

    const closeButton = document.body.querySelector('button[aria-label]') as HTMLButtonElement
    closeButton?.click()

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('emite close cuando el temporizador ha terminado', async () => {
    const { wrapper } = await mountWithPlugins(RestTimerModal, {
      props: {
        open: true,
        exerciseName: 'Press banca',
        remainingSeconds: 0,
        totalSeconds: 90,
        isPaused: false,
        isFinished: true,
      },
      attachTo: document.body,
    })
    await nextTick()

    expect(document.body.textContent).toContain(i18n.global.t('workouts.restTimer.finished'))

    const closeButton = document.body.querySelector('button[aria-label]') as HTMLButtonElement
    closeButton?.click()

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emite togglePause al pulsar pausa/reanudar', async () => {
    const { wrapper } = await mountWithPlugins(RestTimerModal, {
      props: {
        open: true,
        exerciseName: 'Press banca',
        remainingSeconds: 30,
        totalSeconds: 90,
        isPaused: false,
        isFinished: false,
      },
      attachTo: document.body,
    })
    await nextTick()

    const pauseButton = Array.from(document.body.querySelectorAll('button')).find((button) =>
      button.textContent?.includes(i18n.global.t('workouts.restTimer.pause')),
    ) as HTMLButtonElement | undefined
    pauseButton?.click()

    expect(wrapper.emitted('togglePause')).toHaveLength(1)
  })

  it('maneja tecla Escape para cancelar o cerrar', async () => {
    const { wrapper } = await mountWithPlugins(RestTimerModal, {
      props: {
        open: true,
        exerciseName: 'Press banca',
        remainingSeconds: 30,
        totalSeconds: 90,
        isPaused: false,
        isFinished: false,
      },
      attachTo: document.body,
    })
    await nextTick()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('cancel')).toHaveLength(1)

    await wrapper.setProps({ isFinished: true, remainingSeconds: 0 })
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('bloquea scroll del body cuando está abierto', async () => {
    const { wrapper } = await mountWithPlugins(RestTimerModal, {
      props: {
        open: false,
        exerciseName: 'Press banca',
        remainingSeconds: 30,
        totalSeconds: 90,
        isPaused: false,
        isFinished: false,
      },
      attachTo: document.body,
    })

    await wrapper.setProps({ open: true })
    expect(document.body.style.overflow).toBe('hidden')

    await wrapper.setProps({ open: false })
    expect(document.body.style.overflow).toBe('')
  })

  it('muestra estado pausado y clase urgente', async () => {
    await mountWithPlugins(RestTimerModal, {
      props: {
        open: true,
        exerciseName: 'Press banca',
        remainingSeconds: 5,
        totalSeconds: 90,
        isPaused: true,
        isFinished: false,
      },
      attachTo: document.body,
    })
    await nextTick()

    expect(document.body.textContent).toContain(i18n.global.t('workouts.restTimer.paused'))
    expect(document.body.querySelector('.rest-timer__ring--paused')).not.toBeNull()
  })
})
