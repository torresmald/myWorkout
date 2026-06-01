<script setup lang="ts">
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { BTN_PRIMARY_FULL_CLASS, BTN_SECONDARY_CLASS } from '@/constants/ui.constants'

withDefaults(
  defineProps<{
    loading?: boolean
    disabled?: boolean
    variant?: 'primary' | 'secondary'
    type?: 'button' | 'submit'
  }>(),
  {
    loading: false,
    disabled: false,
    variant: 'primary',
    type: 'submit',
  },
)

const variantClass = {
  primary: BTN_PRIMARY_FULL_CLASS,
  secondary: `${BTN_SECONDARY_CLASS} w-full`,
}
</script>

<template>
  <button
    :type="type"
    :disabled="loading || disabled"
    :class="variantClass[variant]"
  >
    <span class="inline-flex items-center justify-center gap-2">
      <LoadingSpinner v-if="loading" size="sm" />
      <slot />
    </span>
  </button>
</template>
