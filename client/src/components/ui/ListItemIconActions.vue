<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { BTN_ICON_GHOST_CLASS, BTN_ICON_DANGER_CLASS } from '@/constants/ui.constants'

defineProps<{
  disabled?: boolean
  deleting?: boolean
  showTimer?: boolean
}>()

const emit = defineEmits<{
  timer: []
  edit: []
  delete: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex shrink-0 items-center gap-1">
    <button
      v-if="showTimer"
      type="button"
      :class="BTN_ICON_GHOST_CLASS"
      :disabled="disabled || deleting"
      :aria-label="t('workouts.restTimer.startRest')"
      @click="emit('timer')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-5 w-5"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    </button>

    <button
      type="button"
      :class="BTN_ICON_GHOST_CLASS"
      :disabled="disabled || deleting"
      :aria-label="t('common.edit')"
      @click="emit('edit')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    </button>

    <button
      type="button"
      :class="BTN_ICON_DANGER_CLASS"
      :disabled="disabled || deleting"
      :aria-label="t('common.delete')"
      @click="emit('delete')"
    >
      <LoadingSpinner v-if="deleting" size="sm" />
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M3 6h18" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" x2="10" y1="11" y2="17" />
        <line x1="14" x2="14" y1="11" y2="17" />
      </svg>
    </button>
  </div>
</template>
