<script setup lang="ts">
import { CARD_CLASS } from '@/constants/ui.constants'

defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <div :class="`${CARD_CLASS} w-full max-w-md p-8`">
    <h1 class="mb-2 text-2xl font-bold text-gray-900">{{ title }}</h1>
    <p class="mb-6 text-sm text-gray-600">{{ description }}</p>
    <slot />
  </div>
</template>
