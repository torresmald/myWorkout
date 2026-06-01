<script setup lang="ts">
import Skeleton from '@/components/ui/Skeleton.vue'
import { CARD_COMPACT_CLASS } from '@/constants/ui.constants'

withDefaults(
  defineProps<{
    count?: number
    columns?: 2 | 3
  }>(),
  {
    count: 6,
    columns: 3,
  },
)
</script>

<template>
  <div
    class="grid gap-4"
    :class="columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'"
    aria-hidden="true"
  >
    <div v-for="index in count" :key="index" :class="[CARD_COMPACT_CLASS, 'space-y-3']">
      <Skeleton width="60%" height="0.875rem" />
      <Skeleton width="40%" height="1.75rem" />
    </div>
  </div>
</template>
