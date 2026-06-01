<script setup lang="ts">
import Skeleton from '@/components/ui/Skeleton.vue'
import { LIST_ITEM_ROW_CLASS } from '@/constants/ui.constants'

withDefaults(
  defineProps<{
    count?: number
  }>(),
  {
    count: 4,
  },
)
</script>

<template>
  <ul class="divide-y divide-border-default" aria-hidden="true">
    <li v-for="index in count" :key="index" :class="LIST_ITEM_ROW_CLASS">
      <div class="min-w-0 flex-1 space-y-2">
        <Skeleton width="45%" height="1rem" />
        <Skeleton width="70%" height="0.875rem" />
      </div>
      <Skeleton width="2.5rem" height="2.5rem" rounded="lg" />
    </li>
  </ul>
</template>
