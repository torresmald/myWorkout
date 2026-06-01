import { onUnmounted, ref } from 'vue'

import { playRestTimerCompleteSound, unlockRestTimerSound } from '@/utils/rest-timer-sound.util'

export function useRestTimer() {
  const isOpen = ref(false)
  const isPaused = ref(false)
  const isFinished = ref(false)
  const exerciseName = ref('')
  const remainingSeconds = ref(0)

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
    playRestTimerCompleteSound()
  }

  function start(name: string, totalSeconds: number) {
    unlockRestTimerSound()

    exerciseName.value = name
    isOpen.value = true
    isPaused.value = false
    isFinished.value = false
    endsAt = Date.now() + totalSeconds * 1000
    pausedRemaining = totalSeconds
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
    start,
    pause,
    resume,
    togglePause,
    cancel,
    closeAfterFinish,
  }
}
