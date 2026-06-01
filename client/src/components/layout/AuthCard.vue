<script setup lang="ts">
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { CARD_CLASS } from '@/constants/ui.constants'

defineProps<{
  title: string
  description: string
  loading?: boolean
  loadingMessage?: string
}>()
</script>

<template>
  <div :class="`${CARD_CLASS} relative w-full max-w-md p-6 sm:p-8`">
    <h1 class="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">{{ title }}</h1>
    <p class="mb-6 text-sm text-gray-600">{{ description }}</p>

    <div :class="{ 'pointer-events-none opacity-60': loading }">
      <slot />
    </div>

    <div
      v-if="loading"
      class="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-white/80"
      aria-live="polite"
      aria-busy="true"
    >
      <LoadingSpinner size="lg" class="text-blue-600" />
      <p class="text-sm font-medium text-gray-700">
        {{ loadingMessage ?? 'Procesando...' }}
      </p>
    </div>
  </div>
</template>
