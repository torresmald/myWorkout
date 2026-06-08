import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

function installMockAudio() {
  const play = vi.fn().mockResolvedValue(undefined)
  const pause = vi.fn()
  let currentTime = 0

  class MockAudio {
    preload = 'auto'
    volume = 1
    src = ''

    get currentTime() {
      return currentTime
    }

    set currentTime(value: number) {
      currentTime = value
    }

    play = play
    pause = pause
  }

  vi.stubGlobal(
    'Audio',
    vi.fn(function MockAudioConstructor(this: MockAudio, url?: string) {
      Object.assign(this, new MockAudio())
      this.src = url ?? ''
      return this
    }),
  )

  const vibrate = vi.fn()
  vi.stubGlobal('navigator', {
    ...navigator,
    vibrate,
  })

  return { play, pause, vibrate }
}

describe('rest-timer-sound.util', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('desbloquea audio con reproducción silenciosa', async () => {
    const { play } = installMockAudio()
    const { unlockRestTimerSound } = await import('@/utils/rest-timer-sound.util')

    unlockRestTimerSound()

    expect(play).toHaveBeenCalled()
  })

  it('reproduce el sonido al completar el descanso', async () => {
    const { play } = installMockAudio()
    const { playRestTimerCompleteSound } = await import('@/utils/rest-timer-sound.util')

    await playRestTimerCompleteSound()

    expect(play).toHaveBeenCalled()
  })

  it('vibra si la reproducción falla', async () => {
    const { play, vibrate } = installMockAudio()
    play.mockRejectedValueOnce(new Error('blocked'))

    const { playRestTimerCompleteSound } = await import('@/utils/rest-timer-sound.util')

    await playRestTimerCompleteSound()

    expect(vibrate).toHaveBeenCalledWith([200, 100, 200])
  })
})
