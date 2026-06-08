import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  acquireWakeLock,
  releaseWakeLockReason,
  requestWakeLockFromUserGesture,
  REST_TIMER_REASON,
  SESSION_REASON,
  wakeLockNeedsUserGesture,
} from '@/utils/wake-lock.util'

describe('wake-lock.util', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(async () => {
    await releaseWakeLockReason(SESSION_REASON)
    await releaseWakeLockReason(REST_TIMER_REASON)
    vi.unstubAllGlobals()
  })

  it('adquiere y libera wake lock por motivo', async () => {
    const request = vi.fn().mockResolvedValue({
      addEventListener: vi.fn(),
    })

    vi.stubGlobal('navigator', {
      wakeLock: { request },
    })

    await acquireWakeLock(SESSION_REASON)
    expect(request).toHaveBeenCalledWith('screen')

    await releaseWakeLockReason(SESSION_REASON)
    expect(wakeLockNeedsUserGesture()).toBe(false)
  })

  it('marca que necesita gesto cuando falla la petición', async () => {
    vi.stubGlobal('navigator', {
      wakeLock: {
        request: vi.fn().mockRejectedValue(new Error('NotAllowedError')),
      },
    })

    await acquireWakeLock(SESSION_REASON)

    expect(wakeLockNeedsUserGesture()).toBe(true)

    const request = vi.fn().mockResolvedValue({
      addEventListener: vi.fn(),
    })
    vi.stubGlobal('navigator', {
      wakeLock: { request },
    })

    await requestWakeLockFromUserGesture()

    expect(request).toHaveBeenCalledWith('screen')
    expect(wakeLockNeedsUserGesture()).toBe(false)
  })
})
