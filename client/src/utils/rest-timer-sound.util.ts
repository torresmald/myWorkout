let audioContext: AudioContext | null = null

export function unlockRestTimerSound(): void {
  if (typeof window === 'undefined') {
    return
  }

  audioContext ??= new AudioContext()

  if (audioContext.state === 'suspended') {
    void audioContext.resume()
  }
}

function playTone(ctx: AudioContext, frequency: number, startAt: number, duration: number): void {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.exponentialRampToValueAtTime(0.35, startAt + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)

  oscillator.connect(gain)
  gain.connect(ctx.destination)

  oscillator.start(startAt)
  oscillator.stop(startAt + duration)
}

export function playRestTimerCompleteSound(): void {
  if (typeof window === 'undefined') {
    return
  }

  const ctx = audioContext ?? new AudioContext()
  audioContext = ctx

  if (ctx.state === 'suspended') {
    void ctx.resume()
  }

  const now = ctx.currentTime

  playTone(ctx, 880, now, 0.18)
  playTone(ctx, 880, now + 0.28, 0.18)
  playTone(ctx, 1174.66, now + 0.56, 0.28)
}
