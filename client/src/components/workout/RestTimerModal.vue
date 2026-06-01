<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  BTN_DANGER_CLASS,
  BTN_PRIMARY_CLASS,
  BTN_SECONDARY_CLASS,
} from '@/constants/ui.constants'
import { formatCountdown } from '@/utils/rest-timer.util'

const props = defineProps<{
  open: boolean
  exerciseName: string
  remainingSeconds: number
  totalSeconds: number
  isPaused: boolean
  isFinished: boolean
}>()

const emit = defineEmits<{
  cancel: []
  togglePause: []
  close: []
}>()

const { t } = useI18n()

const RING_RADIUS = 118
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

const closeAriaLabel = computed(() =>
  props.isFinished ? t('common.close') : t('workouts.restTimer.cancelRest'),
)

const progress = computed(() => {
  if (props.totalSeconds <= 0) {
    return 0
  }

  if (props.isFinished) {
    return 1
  }

  return 1 - props.remainingSeconds / props.totalSeconds
})

const ringOffset = computed(() => RING_CIRCUMFERENCE * (1 - progress.value))

const isUrgent = computed(
  () => !props.isFinished && !props.isPaused && props.remainingSeconds > 0 && props.remainingSeconds <= 10,
)

watch(
  () => props.open,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  },
)

function handleKeydown(event: KeyboardEvent) {
  if (!props.open) {
    return
  }

  if (event.key === 'Escape') {
    if (props.isFinished) {
      emit('close')
    } else {
      emit('cancel')
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="rest-timer fixed inset-0 z-50 flex flex-col px-4 pb-[env(safe-area-inset-bottom,0px)] pt-[env(safe-area-inset-top,0px)] text-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rest-timer-title"
      >
        <div class="rest-timer__backdrop" aria-hidden="true" />

        <div class="relative z-10 flex items-center justify-between py-4">
          <div class="min-w-0 pr-4">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              {{ t('workouts.restTimer.label') }}
            </p>
            <h2 id="rest-timer-title" class="truncate text-lg font-semibold sm:text-xl">
              {{ exerciseName }}
            </h2>
          </div>

          <button
            type="button"
            class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
            :aria-label="closeAriaLabel"
            @click="isFinished ? emit('close') : emit('cancel')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              class="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div class="relative z-10 flex flex-1 flex-col items-center justify-center gap-8">
          <p
            v-if="isFinished"
            class="text-center text-2xl font-bold text-emerald-300 sm:text-3xl"
          >
            {{ t('workouts.restTimer.finished') }}
          </p>

          <div
            class="relative flex items-center justify-center"
            :class="{ 'rest-timer__ring--urgent': isUrgent, 'rest-timer__ring--paused': isPaused && !isFinished }"
          >
            <svg
              class="rest-timer__ring h-72 w-72 -rotate-90 sm:h-80 sm:w-80"
              viewBox="0 0 260 260"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="rest-timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#60a5fa" />
                  <stop offset="100%" stop-color="#2563eb" />
                </linearGradient>
                <linearGradient id="rest-timer-gradient-done" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#6ee7b7" />
                  <stop offset="100%" stop-color="#10b981" />
                </linearGradient>
              </defs>
              <circle
                cx="130"
                cy="130"
                :r="RING_RADIUS"
                fill="none"
                stroke="rgb(255 255 255 / 12%)"
                stroke-width="10"
              />
              <circle
                cx="130"
                cy="130"
                :r="RING_RADIUS"
                fill="none"
                :stroke="isFinished ? 'url(#rest-timer-gradient-done)' : 'url(#rest-timer-gradient)'"
                stroke-width="10"
                stroke-linecap="round"
                :stroke-dasharray="RING_CIRCUMFERENCE"
                :stroke-dashoffset="ringOffset"
                class="rest-timer__ring-progress"
              />
            </svg>

            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <p
                class="font-mono text-6xl font-bold tabular-nums tracking-tight sm:text-7xl"
                :class="{
                  'text-emerald-300': isFinished,
                  'text-white': !isFinished,
                }"
                aria-live="polite"
              >
                {{ isFinished ? '0:00' : formatCountdown(remainingSeconds) }}
              </p>
              <p v-if="isPaused && !isFinished" class="mt-2 text-sm font-medium text-white/70">
                {{ t('workouts.restTimer.paused') }}
              </p>
            </div>
          </div>
        </div>

        <div class="relative z-10 flex flex-col gap-3 pb-4 sm:flex-row sm:justify-center">
          <template v-if="isFinished">
            <button
              type="button"
              :class="[BTN_PRIMARY_CLASS, 'w-full shadow-lg shadow-blue-900/30 sm:w-auto']"
              @click="emit('close')"
            >
              {{ t('workouts.restTimer.continue') }}
            </button>
          </template>

          <template v-else>
            <button
              type="button"
              :class="[
                BTN_SECONDARY_CLASS,
                'w-full border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 sm:w-auto',
              ]"
              @click="emit('togglePause')"
            >
              {{ isPaused ? t('workouts.restTimer.resume') : t('workouts.restTimer.pause') }}
            </button>

            <button
              type="button"
              :class="[
                BTN_DANGER_CLASS,
                'w-full border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 sm:w-auto',
              ]"
              @click="emit('cancel')"
            >
              {{ t('common.cancel') }}
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.rest-timer__backdrop {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to bottom, rgb(2 6 23 / 88%), rgb(15 23 42 / 92%)),
    url('/images/gym-bg.jpg');
  background-position: center;
  background-size: cover;
  filter: saturate(1.1);
}

.rest-timer__ring-progress {
  transition: stroke-dashoffset 0.35s ease, stroke 0.3s ease;
}

.rest-timer__ring--urgent .rest-timer__ring-progress {
  animation: rest-timer-pulse 0.9s ease-in-out infinite;
}

.rest-timer__ring--paused .rest-timer__ring-progress {
  opacity: 0.45;
}

@keyframes rest-timer-pulse {
  0%,
  100% {
    filter: drop-shadow(0 0 0 rgb(96 165 250 / 0));
  }

  50% {
    filter: drop-shadow(0 0 14px rgb(96 165 250 / 0.75));
  }
}
</style>
