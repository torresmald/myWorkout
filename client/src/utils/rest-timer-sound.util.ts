const REST_COMPLETE_SOUND_URL = '/sounds/rest-complete.wav'

let restCompleteAudio: HTMLAudioElement | null = null

function getAudioElement(): HTMLAudioElement | null {
  if (typeof window === 'undefined') {
    return null
  }

  restCompleteAudio ??= new Audio(REST_COMPLETE_SOUND_URL)
  restCompleteAudio.preload = 'auto'

  return restCompleteAudio
}

function vibrateRestComplete(): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
    return
  }

  navigator.vibrate([200, 100, 200])
}

export function unlockRestTimerSound(): void {
  const audio = getAudioElement()

  if (!audio) {
    return
  }

  const previousVolume = audio.volume
  audio.volume = 0.01
  audio.currentTime = 0

  void audio
    .play()
    .then(() => {
      audio.pause()
      audio.currentTime = 0
      audio.volume = previousVolume
    })
    .catch(() => {
      audio.volume = previousVolume
    })
}

export async function playRestTimerCompleteSound(): Promise<void> {
  const audio = getAudioElement()

  if (!audio) {
    vibrateRestComplete()
    return
  }

  audio.volume = 1
  audio.currentTime = 0

  try {
    await audio.play()
    return
  } catch {
    vibrateRestComplete()
  }
}

export function previewRestTimerCompleteSound(): Promise<void> {
  unlockRestTimerSound()
  return playRestTimerCompleteSound()
}
