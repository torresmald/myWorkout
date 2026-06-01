<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: string
    height?: string
    rounded?: 'sm' | 'md' | 'lg' | 'full' | 'none'
  }>(),
  {
    width: '100%',
    height: '1rem',
    rounded: 'md',
  },
)

const roundedClass: Record<string, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
}
</script>

<template>
  <div
    class="animate-pulse bg-bg-muted"
    :class="roundedClass[rounded]"
    :style="{ width, height }"
    aria-hidden="true"
  />
</template>
