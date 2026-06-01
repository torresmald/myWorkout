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
    class="mx-auto flex flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:gap-6 sm:p-6"
    :class="maxWidthClass[maxWidth]"
  >
    <slot />
  </div>
</template>
