<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useToastStore } from '@/stores/toast.store'

const toastStore = useToastStore()
const { toasts } = storeToRefs(toastStore)

function toastClasses(type: 'success' | 'error'): string {
  return type === 'success'
    ? 'border-green-200 bg-green-50 text-green-800'
    : 'border-red-200 bg-red-50 text-red-800'
}
</script>

<template>
  <div
    aria-live="polite"
    class="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col gap-2 items-center pb-[env(safe-area-inset-bottom,0px)]"
  >
    <TransitionGroup
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-4 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-4 opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex min-w-0 items-center gap-3 rounded-lg border px-4 py-3 shadow-lg max-w-[80%] sm:max-w-full"
        :class="toastClasses(toast.type)"
        role="alert"
      >
        <p class="min-w-0 flex-1 break-words text-sm font-medium leading-snug sm:text-base">
          {{ toast.message }}
        </p>
        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center text-current opacity-60 transition hover:opacity-100"
          aria-label="Cerrar"
          @click="toastStore.remove(toast.id)"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
