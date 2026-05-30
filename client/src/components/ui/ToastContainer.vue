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
    class="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2"
  >
    <TransitionGroup
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-x-4 opacity-0"
      enter-to-class="translate-x-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-x-0 opacity-100"
      leave-to-class="translate-x-4 opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg"
        :class="toastClasses(toast.type)"
        role="alert"
      >
        <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
        <button
          type="button"
          class="text-current opacity-60 transition hover:opacity-100"
          aria-label="Cerrar"
          @click="toastStore.remove(toast.id)"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
