<script setup lang="ts">
import { computed } from 'vue'

import { APP_NAME } from '@/constants/app.constants'

const props = withDefaults(
  defineProps<{
    showText?: boolean
    size?: 'sm' | 'md' | 'lg'
    inverted?: boolean
  }>(),
  {
    showText: false,
    size: 'md',
    inverted: false,
  },
)

const iconSizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-8 w-8'
    case 'lg':
      return 'h-12 w-12'
    default:
      return 'h-9 w-9'
  }
})

const textSizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-base'
    case 'lg':
      return 'text-2xl'
    default:
      return 'text-lg'
  }
})
</script>

<template>
  <span class="inline-flex items-center gap-2.5">
    <svg
      :class="iconSizeClass"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="12" class="fill-blue-600" />
      <rect x="9" y="20" width="6" height="8" rx="2" fill="white" />
      <rect x="33" y="20" width="6" height="8" rx="2" fill="white" />
      <rect x="13.5" y="22" width="21" height="4" rx="2" fill="white" />
      <path
        d="M24 14v4M24 30v4"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        opacity="0.85"
      />
    </svg>
    <span
      v-if="showText"
      :class="[
        textSizeClass,
        'font-bold tracking-tight',
        inverted ? 'text-white' : 'text-text-primary',
      ]"
    >
      {{ APP_NAME }}
    </span>
  </span>
</template>
