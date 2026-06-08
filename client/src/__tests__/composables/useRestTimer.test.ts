import { defineComponent, onMounted } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createUserPublic } from '@/__tests__/fixtures/profile.fixture'
import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import { useRestTimer } from '@/composables/useRestTimer'
import { useAuthStore } from '@/stores/auth.store'
import * as restTimerSound from '@/utils/rest-timer-sound.util'

vi.mock('@/utils/rest-timer-sound.util', () => ({
  unlockRestTimerSound: vi.fn(),
  playRestTimerCompleteSound: vi.fn(),
}))

function mountRestTimer(userOverrides: Parameters<typeof createUserPublic>[0] = {}) {
  let timer!: ReturnType<typeof useRestTimer>
  const pinia = setupTestPinia()
  useAuthStore(pinia).setUser(createUserPublic(userOverrides))

  const TestComponent = defineComponent({
    setup() {
      timer = useRestTimer()
      return { timer }
    },
    template: '<div />',
  })

  mount(TestComponent, {
    global: {
      plugins: [pinia],
    },
  })

  return timer
}

function mountRestTimerWithUnmount(userOverrides: Parameters<typeof createUserPublic>[0] = {}) {
  let timer!: ReturnType<typeof useRestTimer>
  const pinia = setupTestPinia()
  useAuthStore(pinia).setUser(createUserPublic(userOverrides))

  const TestComponent = defineComponent({
    setup() {
      timer = useRestTimer()
      return { timer }
    },
    template: '<div />',
  })

  return {
    timer: () => timer,
    wrapper: mount(TestComponent, {
      global: {
        plugins: [pinia],
      },
    }),
  }
}

describe('useRestTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('inicia el temporizador con el nombre y segundos indicados', () => {
    const timer = mountRestTimer()

    timer.start('Press banca', 90)

    expect(restTimerSound.unlockRestTimerSound).toHaveBeenCalled()
    expect(timer.isOpen.value).toBe(true)
    expect(timer.isPaused.value).toBe(false)
    expect(timer.isFinished.value).toBe(false)
    expect(timer.exerciseName.value).toBe('Press banca')
    expect(timer.totalSeconds.value).toBe(90)
    expect(timer.remainingSeconds.value).toBe(90)
  })

  it('pausa y reanuda el temporizador', () => {
    const timer = mountRestTimer()

    timer.start('Sentadilla', 60)
    vi.advanceTimersByTime(10_000)

    timer.pause()

    expect(timer.isPaused.value).toBe(true)
    expect(timer.remainingSeconds.value).toBeLessThanOrEqual(51)

    const pausedRemaining = timer.remainingSeconds.value

    vi.advanceTimersByTime(5_000)
    expect(timer.remainingSeconds.value).toBe(pausedRemaining)

    timer.resume()

    expect(timer.isPaused.value).toBe(false)
    vi.advanceTimersByTime(100)
    expect(timer.remainingSeconds.value).toBeLessThanOrEqual(pausedRemaining)
  })

  it('alterna pausa con togglePause', () => {
    const timer = mountRestTimer()

    timer.start('Peso muerto', 30)

    timer.togglePause()
    expect(timer.isPaused.value).toBe(true)

    timer.togglePause()
    expect(timer.isPaused.value).toBe(false)
  })

  it('no pausa si el temporizador está cerrado, pausado o finalizado', () => {
    const timer = mountRestTimer()

    timer.pause()
    expect(timer.isPaused.value).toBe(false)

    timer.start('Curl', 5)
    timer.pause()
    timer.pause()
    expect(timer.isPaused.value).toBe(true)

    timer.resume()
    vi.advanceTimersByTime(5_100)
    expect(timer.isFinished.value).toBe(true)

    timer.pause()
    expect(timer.isPaused.value).toBe(false)
  })

  it('no reanuda si el temporizador no está pausado o ya finalizó', () => {
    const timer = mountRestTimer()

    timer.resume()
    expect(timer.isPaused.value).toBe(false)

    timer.start('Remo', 10)
    timer.resume()
    expect(timer.isPaused.value).toBe(false)

    vi.advanceTimersByTime(11_000)
    timer.resume()
    expect(timer.isFinished.value).toBe(true)
  })

  it('finaliza el temporizador y reproduce sonido al llegar a cero', () => {
    const timer = mountRestTimer()

    timer.start('Dominadas', 2)
    vi.advanceTimersByTime(2_100)

    expect(timer.isFinished.value).toBe(true)
    expect(timer.remainingSeconds.value).toBe(0)
    expect(restTimerSound.playRestTimerCompleteSound).toHaveBeenCalled()
  })

  it('no reproduce sonido si la preferencia está desactivada', () => {
    const timer = mountRestTimer({ restTimerSoundEnabled: false })

    timer.start('Dominadas', 2)
    vi.advanceTimersByTime(2_100)

    expect(timer.isFinished.value).toBe(true)
    expect(restTimerSound.playRestTimerCompleteSound).not.toHaveBeenCalled()
  })

  it('cancela y reinicia el estado del temporizador', () => {
    const timer = mountRestTimer()

    timer.start('Fondos', 45)
    timer.cancel()

    expect(timer.isOpen.value).toBe(false)
    expect(timer.isPaused.value).toBe(false)
    expect(timer.isFinished.value).toBe(false)
    expect(timer.exerciseName.value).toBe('')
    expect(timer.remainingSeconds.value).toBe(0)
    expect(timer.totalSeconds.value).toBe(0)
  })

  it('cierra tras finalizar solo cuando isFinished es true', () => {
    const timer = mountRestTimer()

    timer.closeAfterFinish()
    expect(timer.isOpen.value).toBe(false)

    timer.start('Plancha', 1)
    vi.advanceTimersByTime(1_100)
    timer.closeAfterFinish()

    expect(timer.isOpen.value).toBe(false)
  })

  it('detiene el intervalo al desmontar el componente', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
    const { timer, wrapper } = mountRestTimerWithUnmount()

    timer().start('Test', 30)
    wrapper.unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
  })
})
