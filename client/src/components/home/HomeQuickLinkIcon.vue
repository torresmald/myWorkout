<script setup lang="ts">
import type { HomeQuickLinkIcon } from '@/constants/home.constants'

defineProps<{
  icon: HomeQuickLinkIcon
}>()
</script>

<template>
  <span
    class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
    aria-hidden="true"
  >
    <svg
      v-if="icon === 'dumbbell'"
      viewBox="0 0 24 24"
      class="h-6 w-6"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
    >
      <rect x="2" y="9" width="3" height="6" rx="1" />
      <rect x="19" y="9" width="3" height="6" rx="1" />
      <rect x="5" y="10.5" width="14" height="3" rx="1.5" fill="currentColor" stroke="none" />
    </svg>

    <svg
      v-else-if="icon === 'chart'"
      viewBox="0 0 24 24"
      class="h-6 w-6"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
    >
      <path d="M4 19V5M4 19h16" />
      <path d="M8 17V11M12 17V7M16 17v-5" />
    </svg>

    <svg
      v-else-if="icon === 'list'"
      viewBox="0 0 24 24"
      class="h-6 w-6"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
    >
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="5" cy="6" r="1" fill="currentColor" />
      <circle cx="5" cy="12" r="1" fill="currentColor" />
      <circle cx="5" cy="18" r="1" fill="currentColor" />
    </svg>

    <svg
      v-else
      viewBox="0 0 24 24"
      class="h-6 w-6"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M6 19c0-3.314 2.686-6 6-6s6 2.686 6 6" />
    </svg>
  </span>
</template>
