<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    text?: string
    position?: 'top' | 'bottom' | 'left' | 'right'
  }>(),
  {
    text: '',
    position: 'top',
  },
)

const positionClasses = computed(() => {
  switch (props.position) {
    case 'bottom':
      return 'top-full left-1/2 mt-2 -translate-x-1/2'
    case 'left':
      return 'right-full top-1/2 mr-2 -translate-y-1/2'
    case 'right':
      return 'left-full top-1/2 ml-2 -translate-y-1/2'
    default:
      return 'bottom-full left-1/2 mb-2 -translate-x-1/2'
  }
})
</script>

<template>
  <div class="group/tooltip relative inline-flex">
    <slot />

    <span
      v-if="text"
      role="tooltip"
      :class="[
        'pointer-events-none absolute z-50 max-w-48 rounded-lg bg-gray-900 px-2.5 py-1.5 text-center text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 dark:bg-gray-100 dark:text-gray-900',
        positionClasses,
      ]"
    >
      {{ text }}
    </span>
  </div>
</template>
