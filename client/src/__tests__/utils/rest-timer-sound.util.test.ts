import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

function installMockAudioContext(state: AudioContextState = 'running') {
  let lastContext: {
    createOscillator: ReturnType<typeof vi.fn>
    createGain: ReturnType<typeof vi.fn>
    resume: ReturnType<typeof vi.fn>
  } | null = null

  class MockAudioContext {
    state = state
    currentTime = 0
    destination = {}

    createOscillator = vi.fn(() => ({
      type: 'sine',
      frequency: { value: 0 },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }))

    createGain = vi.fn(() => ({
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    }))

    resume = vi.fn().mockResolvedValue(undefined)

    constructor() {
      lastContext = this
    }
  }

  vi.stubGlobal('AudioContext', MockAudioContext)

  return {
    getLastContext: () => lastContext,
  }
}

describe('rest-timer-sound.util', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('desbloquea audio y reanuda contexto suspendido', async () => {
    installMockAudioContext('suspended')
    const { unlockRestTimerSound } = await import('@/utils/rest-timer-sound.util')

    unlockRestTimerSound()
    unlockRestTimerSound()

    expect(typeof AudioContext).toBe('function')
  })

  it('reproduce tonos al completar el descanso', async () => {
    const { getLastContext } = installMockAudioContext('running')
    const { playRestTimerCompleteSound } = await import('@/utils/rest-timer-sound.util')

    playRestTimerCompleteSound()

    expect(getLastContext()?.createOscillator).toHaveBeenCalled()
    expect(getLastContext()?.createGain).toHaveBeenCalled()
  })
})
