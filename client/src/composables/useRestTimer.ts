import { onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { playRestTimerCompleteSound, unlockRestTimerSound } from '@/utils/rest-timer-sound.util'
import {
  acquireWakeLock,
  releaseWakeLockReason,
  requestWakeLockFromUserGesture,
  REST_TIMER_REASON,
} from '@/utils/wake-lock.util'
import { useAuthStore } from '@/stores/auth.store'

export function useRestTimer() {
  const authStore = useAuthStore()
  const { user } = storeToRefs(authStore)
  const isOpen = ref(false)
  const isPaused = ref(false)
  const isFinished = ref(false)
  const exerciseName = ref('')
  const remainingSeconds = ref(0)

  const totalSeconds = ref(0)

  let endsAt = 0
  let pausedRemaining = 0
  let intervalId: ReturnType<typeof setInterval> | null = null

  function stopTick() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function syncRemaining() {
    if (isPaused.value) {
      remainingSeconds.value = pausedRemaining
      return
    }

    const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
    remainingSeconds.value = remaining

    if (remaining <= 0) {
      finish()
    }
  }

  function startTick() {
    stopTick()
    syncRemaining()
    intervalId = setInterval(syncRemaining, 100)
  }

  function finish() {
    stopTick()
    isPaused.value = false
    isFinished.value = true
    remainingSeconds.value = 0

    if (user.value?.restTimerSoundEnabled ?? true) {
      void playRestTimerCompleteSound()
    }
  }

  function start(name: string, totalSecondsParam: number) {
    unlockRestTimerSound()
    void acquireWakeLock(REST_TIMER_REASON)
    void requestWakeLockFromUserGesture()

    exerciseName.value = name
    totalSeconds.value = totalSecondsParam
    isOpen.value = true
    isPaused.value = false
    isFinished.value = false
    endsAt = Date.now() + totalSecondsParam * 1000
    pausedRemaining = totalSecondsParam
    startTick()
  }

  function pause() {
    if (!isOpen.value || isPaused.value || isFinished.value) {
      return
    }

    pausedRemaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
    remainingSeconds.value = pausedRemaining
    isPaused.value = true
  }

  function resume() {
    if (!isOpen.value || !isPaused.value || isFinished.value) {
      return
    }

    endsAt = Date.now() + pausedRemaining * 1000
    isPaused.value = false
    startTick()
  }

  function togglePause() {
    if (isPaused.value) {
      resume()
    } else {
      pause()
    }
  }

  function cancel() {
    stopTick()
    isOpen.value = false
    isPaused.value = false
    isFinished.value = false
    exerciseName.value = ''
    remainingSeconds.value = 0
    totalSeconds.value = 0
    void releaseWakeLockReason(REST_TIMER_REASON)
  }

  function closeAfterFinish() {
    if (!isFinished.value) {
      return
    }

    cancel()
  }

  onUnmounted(() => {
    stopTick()
  })

  return {
    isOpen,
    isPaused,
    isFinished,
    exerciseName,
    remainingSeconds,
    totalSeconds,
    start,
    pause,
    resume,
    togglePause,
    cancel,
    closeAfterFinish,
  }
}
