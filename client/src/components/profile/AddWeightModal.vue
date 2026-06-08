<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import AppModal from '@/components/ui/AppModal.vue'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import { useWeightDisplay } from '@/composables/useWeightDisplay'
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
const { weightFieldLabel, inputBounds, toKg, isValidWeight, unit } = useWeightDisplay()

const weightInput = ref<string | number>('')
const error = ref<string | null>(null)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      weightInput.value = ''
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
  const parsed = parseOptionalNumber(weightInput.value)

  if (parsed === null || !isValidWeight(parsed)) {
    error.value = t('profile.weightInvalid', {
      min: inputBounds.value.min,
      max: inputBounds.value.max,
      unit: unit.value,
    })
    return
  }

  error.value = null
  emit('submit', toKg(parsed))
}
</script>

<template>
  <AppModal :open="open" :title="t('profile.addWeight.title')" @close="handleClose">
    <p class="mb-4 text-sm text-text-secondary">{{ t('profile.addWeight.description') }}</p>

    <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
      <div>
        <label for="add-weight-input" :class="LABEL_CLASS">{{ weightFieldLabel }}</label>
        <input
          id="add-weight-input"
          v-model="weightInput"
          type="number"
          :min="inputBounds.min"
          :max="inputBounds.max"
          :step="inputBounds.step"
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
