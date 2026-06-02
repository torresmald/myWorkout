<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { BTN_PRIMARY_CLASS } from '@/constants/ui.constants'

export type EmptyStateVariant =
  | 'workouts'
  | 'exercise-types'
  | 'exercises'
  | 'stats'
  | 'admin'
  | 'weight'
  | 'templates'

const props = defineProps<{
  variant: EmptyStateVariant
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
}>()

const emit = defineEmits<{
  action: []
}>()

const illustrationClass = computed(() => {
  switch (props.variant) {
    case 'stats':
      return 'text-blue-500'
    case 'exercise-types':
      return 'text-sky-500'
    case 'exercises':
      return 'text-indigo-500'
    case 'weight':
      return 'text-emerald-500'
    case 'admin':
      return 'text-violet-500'
    case 'templates':
      return 'text-indigo-500'
    default:
      return 'text-blue-600'
  }
})
</script>

<template>
  <div class="flex flex-col items-center px-4 py-10 text-center">
    <div
      class="mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-bg-muted/80"
      :class="illustrationClass"
      aria-hidden="true"
    >
      <svg
        v-if="variant === 'workouts'"
        viewBox="0 0 64 64"
        class="h-16 w-16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="8" y="26" width="8" height="12" rx="2" fill="currentColor" opacity="0.9" />
        <rect x="48" y="26" width="8" height="12" rx="2" fill="currentColor" opacity="0.9" />
        <rect x="14" y="29" width="36" height="6" rx="3" fill="currentColor" />
        <path d="M32 14v8M32 42v8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
      </svg>

      <svg
        v-else-if="variant === 'exercise-types'"
        viewBox="0 0 64 64"
        class="h-16 w-16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="14" y="12" width="36" height="40" rx="6" stroke="currentColor" stroke-width="2.5" />
        <path d="M22 24h20M22 32h20M22 40h12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
      </svg>

      <svg
        v-else-if="variant === 'exercises'"
        viewBox="0 0 64 64"
        class="h-16 w-16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="32" cy="32" r="18" stroke="currentColor" stroke-width="2.5" />
        <path d="M32 20v24M20 32h24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
      </svg>

      <svg
        v-else-if="variant === 'stats'"
        viewBox="0 0 64 64"
        class="h-16 w-16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 48V28M24 48V18M36 48V34M48 48V22" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
        <path d="M10 48h44" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
      </svg>

      <svg
        v-else-if="variant === 'weight'"
        viewBox="0 0 64 64"
        class="h-16 w-16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20 44c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="currentColor" stroke-width="2.5" />
        <rect x="26" y="16" width="12" height="18" rx="6" stroke="currentColor" stroke-width="2.5" />
        <path d="M32 34v10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
      </svg>

      <svg
        v-else-if="variant === 'templates'"
        viewBox="0 0 64 64"
        class="h-16 w-16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="12" y="10" width="40" height="44" rx="6" stroke="currentColor" stroke-width="2.5" />
        <path d="M22 22h20M22 30h20M22 38h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        <path d="M40 42l8 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
      </svg>

      <svg
        v-else
        viewBox="0 0 64 64"
        class="h-16 w-16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="32" cy="22" r="8" stroke="currentColor" stroke-width="2.5" />
        <path d="M16 48c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" stroke-width="2.5" />
      </svg>
    </div>

    <h3 class="text-base font-semibold text-text-primary">{{ title }}</h3>
    <p class="mt-2 max-w-sm text-sm text-text-secondary">{{ description }}</p>

    <RouterLink
      v-if="actionLabel && actionTo"
      :to="actionTo"
      :class="[BTN_PRIMARY_CLASS, 'mt-6']"
    >
      {{ actionLabel }}
    </RouterLink>

    <button
      v-else-if="actionLabel"
      type="button"
      :class="[BTN_PRIMARY_CLASS, 'mt-6']"
      @click="emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>
