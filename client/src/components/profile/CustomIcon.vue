<script setup lang="ts">
import { computed } from 'vue'

import TooltipComponent from '@/components/ui/TooltipComponent.vue'

const props = withDefaults(
  defineProps<{
    size?: number
    viewBox?: string
    svgClass?: string
    tooltip?: string
    position?: 'top' | 'bottom' | 'left' | 'right'
  }>(),
  {
    size: 48,
    viewBox: '0 0 64 64',
    svgClass: 'drop-shadow-md',
    tooltip: '',
    position: 'top',
  },
)

const hasTooltip = computed(() => props.tooltip.trim().length > 0)
</script>

<template>
  <TooltipComponent v-if="hasTooltip" :text="tooltip" :position="position">
    <svg
      :width="size"
      :height="size"
      :viewBox="viewBox"
      xmlns="http://www.w3.org/2000/svg"
      :aria-label="tooltip"
      role="img"
      :class="svgClass"
    >
      <slot />
    </svg>
  </TooltipComponent>

  <svg
    v-else
    :width="size"
    :height="size"
    :viewBox="viewBox"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    :class="svgClass"
  >
    <slot />
  </svg>
</template>
