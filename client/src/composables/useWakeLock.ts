import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue'

import {
  acquireWakeLock,
  releaseWakeLockReason,
  requestWakeLockFromUserGesture,
} from '@/utils/wake-lock.util'

export function useWakeLock(active: Ref<boolean>, reason: string) {
  const isSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator
  const isActive = ref(false)

  async function syncWakeLock() {
    if (!isSupported) {
      isActive.value = false
      return
    }

    if (active.value) {
      await acquireWakeLock(reason)
      isActive.value = true
      return
    }

    await releaseWakeLockReason(reason)
    isActive.value = false
  }

  async function handleVisibilityChange() {
    if (document.visibilityState === 'visible' && active.value) {
      await requestWakeLockFromUserGesture()
    }
  }

  watch(active, syncWakeLock, { immediate: true })

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(async () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    await releaseWakeLockReason(reason)
    isActive.value = false
  })

  return {
    isSupported,
    isActive,
    requestFromUserGesture: requestWakeLockFromUserGesture,
  }
}
