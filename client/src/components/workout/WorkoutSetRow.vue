<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { BTN_ICON_GHOST_CLASS, INPUT_CLASS } from '@/constants/ui.constants'
import type { WorkoutSetPublic } from '@/interfaces/workout-set.interface'

const props = defineProps<{
  set: WorkoutSetPublic
  saving: boolean
  showPersonalRecord?: boolean
}>()

const emit = defineEmits<{
  toggleComplete: [payload: { reps: number; weight: number | null; completed: boolean }]
}>()

const { t } = useI18n()

const reps = ref(props.set.reps)
const weight = ref<string>(props.set.weight?.toString() ?? '')

const isCompleted = computed(() => props.set.completedAt !== null)

watch(
  () => props.set,
  (nextSet) => {
    reps.value = nextSet.reps
    weight.value = nextSet.weight?.toString() ?? ''
  },
  { deep: true },
)

function parseWeight(): number | null {
  const trimmed = weight.value.trim()
  if (!trimmed) {
    return null
  }

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function handleToggleComplete() {
  const parsedReps = Number(reps.value)

  if (!Number.isInteger(parsedReps) || parsedReps <= 0) {
    return
  }

  emit('toggleComplete', {
    reps: parsedReps,
    weight: parseWeight(),
    completed: !isCompleted.value,
  })
}
</script>

<template>
  <div
    :class="[
      'flex items-center gap-2 rounded-lg border px-3 py-2 transition',
      isCompleted
        ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40'
        : 'border-border-default bg-bg-elevated',
    ]"
  >
    <span class="flex w-16 shrink-0 items-center gap-1 text-sm font-medium text-text-secondary">
      {{ t('session.setLabel', { number: props.set.setNumber }) }}
      <span
        v-if="showPersonalRecord"
        class="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-200"
        :title="t('personalRecords.badge')"
      >
        {{ t('personalRecords.badge') }}
      </span>
    </span>

    <div class="grid min-w-0 flex-1 grid-cols-2 gap-2">
      <label class="sr-only" :for="`set-${props.set.id}-reps`">{{ t('session.repsLabel') }}</label>
      <input
        :id="`set-${props.set.id}-reps`"
        v-model.number="reps"
        type="number"
        min="1"
        step="1"
        :disabled="saving || isCompleted"
        :class="[INPUT_CLASS, 'min-h-10 py-2 text-sm']"
        :aria-label="t('session.repsLabel')"
      />

      <label class="sr-only" :for="`set-${props.set.id}-weight`">
        {{ t('session.weightLabel') }}
      </label>
      <input
        :id="`set-${props.set.id}-weight`"
        v-model="weight"
        type="number"
        min="0"
        step="0.5"
        :disabled="saving || isCompleted"
        :class="[INPUT_CLASS, 'min-h-10 py-2 text-sm']"
        :placeholder="t('common.optional')"
        :aria-label="t('session.weightLabel')"
      />
    </div>

    <button
      type="button"
      :class="[
        BTN_ICON_GHOST_CLASS,
        isCompleted ? 'border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300' : '',
      ]"
      :disabled="saving"
      :aria-label="isCompleted ? t('session.uncompleteSet') : t('session.completeSet')"
      @click="handleToggleComplete"
    >
      <LoadingSpinner v-if="saving" size="sm" />
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
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </button>
  </div>
</template>
