<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import AppModal from '@/components/ui/AppModal.vue'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import {
  BTN_ACTIONS_CLASS,
  BTN_MOBILE_FULL_CLASS,
  BTN_SECONDARY_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
} from '@/constants/ui.constants'
import { parseOptionalNumber } from '@/utils/profile.util'

const props = defineProps<{
  open: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [weightKg: number]
}>()

const { t } = useI18n()

const weightKg = ref<string | number>('')
const error = ref<string | null>(null)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      weightKg.value = ''
      error.value = null
    }
  },
)

function handleClose() {
  if (props.loading) {
    return
  }

  emit('close')
}

function handleSubmit() {
  const parsed = parseOptionalNumber(weightKg.value)

  if (parsed === null || parsed < 20 || parsed > 500) {
    error.value = t('profile.weightInvalid')
    return
  }

  error.value = null
  emit('submit', parsed)
}
</script>

<template>
  <AppModal :open="open" :title="t('profile.addWeight.title')" @close="handleClose">
    <p class="mb-4 text-sm text-text-secondary">{{ t('profile.addWeight.description') }}</p>

    <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
      <div>
        <label for="add-weight-kg" :class="LABEL_CLASS">{{ t('common.weightKg') }}</label>
        <input
          id="add-weight-kg"
          v-model="weightKg"
          type="number"
          min="20"
          max="500"
          step="0.1"
          inputmode="decimal"
          autofocus
          :disabled="loading"
          :class="INPUT_CLASS"
          :placeholder="t('common.weightPlaceholder')"
        />
        <p v-if="error" class="mt-1.5 text-sm text-red-600 dark:text-red-400">{{ error }}</p>
      </div>

      <div :class="[BTN_ACTIONS_CLASS, 'sm:justify-end']">
        <button
          type="button"
          :class="[BTN_SECONDARY_CLASS, BTN_MOBILE_FULL_CLASS]"
          :disabled="loading"
          @click="handleClose"
        >
          {{ t('common.cancel') }}
        </button>
        <LoadingButton type="submit" :loading="loading" class="sm:w-auto">
          {{ t('common.register') }}
        </LoadingButton>
      </div>
    </form>
  </AppModal>
</template>
