const REST_TIMER_REASON = 'rest-timer'
const SESSION_REASON = 'session'

const holdReasons = new Set<string>()

let wakeLock: WakeLockSentinel | null = null
let needsUserGesture = false

function isSupported(): boolean {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator
}

async function releaseWakeLock(): Promise<void> {
  if (!wakeLock) {
    return
  }

  try {
    await wakeLock.release()
  } catch {
    // Ignore release errors.
  } finally {
    wakeLock = null
  }
}

async function requestWakeLock(): Promise<boolean> {
  if (!isSupported() || holdReasons.size === 0) {
    return false
  }

  if (wakeLock) {
    return true
  }

  try {
    wakeLock = await navigator.wakeLock.request('screen')
    needsUserGesture = false

    wakeLock.addEventListener('release', () => {
      wakeLock = null

      if (holdReasons.size > 0) {
        void requestWakeLock()
      }
    })

    return true
  } catch {
    wakeLock = null
    needsUserGesture = true
    return false
  }
}

export async function acquireWakeLock(reason: string): Promise<void> {
  holdReasons.add(reason)
  await requestWakeLock()
}

export async function releaseWakeLockReason(reason: string): Promise<void> {
  holdReasons.delete(reason)

  if (holdReasons.size === 0) {
    await releaseWakeLock()
  }
}

export async function requestWakeLockFromUserGesture(): Promise<boolean> {
  needsUserGesture = false

  if (holdReasons.size === 0) {
    return false
  }

  if (wakeLock) {
    return true
  }

  return requestWakeLock()
}

export function wakeLockNeedsUserGesture(): boolean {
  return needsUserGesture
}

export function wakeLockReasons(): readonly string[] {
  return [...holdReasons]
}

export { REST_TIMER_REASON, SESSION_REASON }
