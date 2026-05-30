<script setup lang="ts">
withDefaults(
  defineProps<{
    maxWidth?: '2xl' | '3xl'
  }>(),
  {
    maxWidth: '2xl',
  },
)

const maxWidthClass = {
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
} as const
</script>

<template>
  <div
    class="mx-auto flex flex-col gap-6 p-4 sm:p-6"
    :class="maxWidthClass[maxWidth]"
  >
    <slot />
  </div>
</template>
