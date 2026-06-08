import { onUnmounted, ref, watch, type Ref } from 'vue'

export function useWakeLock(active: Ref<boolean>) {
  const isSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator
  const isActive = ref(false)
  let wakeLock: WakeLockSentinel | null = null

  async function requestWakeLock() {
    if (!isSupported || !active.value || wakeLock) {
      return
    }

    try {
      wakeLock = await navigator.wakeLock.request('screen')
      isActive.value = true

      wakeLock.addEventListener('release', () => {
        isActive.value = false
        wakeLock = null
      })
    } catch {
      isActive.value = false
      wakeLock = null
    }
  }

  async function releaseWakeLock() {
    if (!wakeLock) {
      isActive.value = false
      return
    }

    try {
      await wakeLock.release()
    } catch {
      // Ignore release errors.
    } finally {
      wakeLock = null
      isActive.value = false
    }
  }

  async function handleVisibilityChange() {
    if (document.visibilityState === 'visible' && active.value) {
      await requestWakeLock()
    }
  }

  watch(
    active,
    async (shouldKeepAwake) => {
      if (shouldKeepAwake) {
        await requestWakeLock()
        document.addEventListener('visibilitychange', handleVisibilityChange)
        return
      }

      document.removeEventListener('visibilitychange', handleVisibilityChange)
      await releaseWakeLock()
    },
    { immediate: true },
  )

  onUnmounted(async () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    await releaseWakeLock()
  })

  return {
    isSupported,
    isActive,
  }
}
