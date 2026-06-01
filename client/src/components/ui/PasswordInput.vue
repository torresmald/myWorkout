<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { INPUT_CLASS } from '@/constants/ui.constants'

const model = defineModel<string>({ required: true })

withDefaults(
  defineProps<{
    id?: string
    disabled?: boolean
    required?: boolean
    minlength?: number
    autocomplete?: string
    placeholder?: string
  }>(),
  {
    disabled: false,
    required: false,
  },
)

const { t } = useI18n()
const visible = ref(false)

const inputType = computed(() => (visible.value ? 'text' : 'password'))
const toggleLabel = computed(() =>
  visible.value ? t('common.hidePassword') : t('common.showPassword'),
)
</script>

<template>
  <div class="relative">
    <input
      :id="id"
      v-model="model"
      :type="inputType"
      :required="required"
      :minlength="minlength"
      :autocomplete="autocomplete"
      :disabled="disabled"
      :placeholder="placeholder"
      :class="`${INPUT_CLASS} pr-11`"
    />
    <button
      type="button"
      class="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-lg text-text-muted transition hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
      :aria-label="toggleLabel"
      :disabled="disabled"
      @click="visible = !visible"
    >
      <svg
        v-if="visible"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        class="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M3 3l18 18M10.58 10.58A2 2 0 0 0 12 15a2 2 0 0 0 1.42-.58M9.88 5.09A10.94 10.94 0 0 1 12 5c7 0 10 7 10 7a18.45 18.45 0 0 1-4.06 5.94M6.1 6.1A18.45 18.45 0 0 0 2 12s3 7 10 7a10.94 10.94 0 0 0 5.91-1.72"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        class="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
  </div>
</template>
