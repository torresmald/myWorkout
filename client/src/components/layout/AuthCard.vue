<script setup lang="ts">
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

defineProps<{
  title: string
  description: string
  loading?: boolean
  loadingMessage?: string
  variant?: 'default' | 'glass'
}>()
</script>

<template>
  <div
    class="relative w-full rounded-2xl p-6 sm:p-8"
    :class="
      variant === 'glass'
        ? 'border border-white/20 bg-white/90 shadow-2xl shadow-black/25 backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/85'
        : 'rounded-xl border border-border-default bg-bg-elevated shadow-sm'
    "
  >
    <h1
      class="mb-2 text-xl font-bold sm:text-2xl"
      :class="variant === 'glass' ? 'text-gray-900 dark:text-white' : 'text-text-primary'"
    >
      {{ title }}
    </h1>
    <p
      class="mb-6 text-sm"
      :class="variant === 'glass' ? 'text-gray-600 dark:text-gray-300' : 'text-text-secondary'"
    >
      {{ description }}
    </p>

    <div :class="{ 'pointer-events-none opacity-60': loading }">
      <slot />
    </div>

    <div
      v-if="loading"
      class="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/80 backdrop-blur-sm dark:bg-gray-950/80"
      aria-live="polite"
      aria-busy="true"
    >
      <LoadingSpinner size="lg" class="text-blue-600" />
      <p class="text-sm font-medium text-text-secondary">
        {{ loadingMessage ?? 'Procesando...' }}
      </p>
    </div>
  </div>
</template>
