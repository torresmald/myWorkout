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
  isPaused: boolean
  isFinished: boolean
}>()

const emit = defineEmits<{
  cancel: []
  togglePause: []
  close: []
}>()

const { t } = useI18n()

const closeAriaLabel = computed(() =>
  props.isFinished ? t('common.close') : t('workouts.restTimer.cancelRest'),
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
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-blue-700 to-blue-900 px-4 pb-[env(safe-area-inset-bottom,0px)] pt-[env(safe-area-inset-top,0px)] text-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rest-timer-title"
      >
        <div class="flex items-center justify-between py-4">
          <div class="min-w-0 pr-4">
            <p class="text-sm font-medium text-blue-100">{{ t('workouts.restTimer.label') }}</p>
            <h2 id="rest-timer-title" class="truncate text-lg font-semibold sm:text-xl">
              {{ exerciseName }}
            </h2>
          </div>

          <button
            type="button"
            class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
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

        <div class="flex flex-1 flex-col items-center justify-center gap-6">
          <p
            v-if="isFinished"
            class="text-center text-2xl font-semibold text-green-200 sm:text-3xl"
          >
            {{ t('workouts.restTimer.finished') }}
          </p>

          <p
            class="font-mono text-7xl font-bold tabular-nums tracking-tight sm:text-8xl"
            :class="{ 'text-green-200': isFinished }"
            aria-live="polite"
          >
            {{ isFinished ? '0:00' : formatCountdown(remainingSeconds) }}
          </p>

          <p v-if="isPaused && !isFinished" class="text-sm font-medium text-blue-100">
            {{ t('workouts.restTimer.paused') }}
          </p>
        </div>

        <div class="flex flex-col gap-3 pb-4 sm:flex-row sm:justify-center">
          <template v-if="isFinished">
            <button type="button" :class="[BTN_PRIMARY_CLASS, 'w-full sm:w-auto']" @click="emit('close')">
              {{ t('workouts.restTimer.continue') }}
            </button>
          </template>

          <template v-else>
            <button
              type="button"
              :class="[BTN_SECONDARY_CLASS, 'w-full border-white/20 bg-white/10 text-white hover:bg-white/20 sm:w-auto']"
              @click="emit('togglePause')"
            >
              {{ isPaused ? t('workouts.restTimer.resume') : t('workouts.restTimer.pause') }}
            </button>

            <button
              type="button"
              :class="[BTN_DANGER_CLASS, 'w-full border-white/20 bg-white/10 hover:bg-white/20 sm:w-auto']"
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
