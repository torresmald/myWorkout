<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useWeightDisplay } from '@/composables/useWeightDisplay'
import {
  CARD_COMPACT_CLASS,
  TEXT_HEADING_CLASS,
  TEXT_MUTED_CLASS,
} from '@/constants/ui.constants'
import type { WorkoutSessionExercise } from '@/interfaces/workout-set.interface'

const props = defineProps<{
  exercise: WorkoutSessionExercise
  workoutStatus: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'
}>()

const { t } = useI18n()
const { formatWeight } = useWeightDisplay()

const completedSets = computed(() =>
  props.exercise.workoutSets.filter((set) => set.completedAt !== null),
)

const showLiveSets = computed(() => props.exercise.workoutSets.length > 0)

function formatSetLine(reps: number, weight: number | null) {
  const weightLabel =
    weight !== null && weight > 0
      ? t('workouts.detail.setWeight', { weight: formatWeight(weight) })
      : t('workouts.detail.bodyweight')

  return t('workouts.detail.setLine', { reps, weight: weightLabel })
}
</script>

<template>
  <section :class="CARD_COMPACT_CLASS">
    <div class="mb-3">
      <p :class="TEXT_HEADING_CLASS">{{ exercise.exerciseType.name }}</p>
      <p :class="['mt-1 text-sm', TEXT_MUTED_CLASS]">
        {{
          t('workouts.exercises.restLabel', {
            seconds: exercise.restSeconds,
          })
        }}
      </p>
    </div>

    <ul v-if="showLiveSets" class="space-y-2">
      <li
        v-for="set in exercise.workoutSets"
        :key="set.id"
        class="flex items-center justify-between rounded-lg border border-border-default px-3 py-2 text-sm"
        :class="set.completedAt ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'bg-bg-muted/40'"
      >
        <span class="font-medium text-text-primary">
          {{ t('workouts.detail.setNumber', { number: set.setNumber }) }}
        </span>
        <span class="text-text-secondary">
          {{ formatSetLine(set.reps, set.weight) }}
        </span>
        <span
          class="text-xs font-medium"
          :class="set.completedAt ? 'text-emerald-700 dark:text-emerald-300' : 'text-text-muted'"
        >
          {{
            set.completedAt
              ? t('workouts.detail.setCompleted')
              : t('workouts.detail.setPending')
          }}
        </span>
      </li>
    </ul>

    <p v-else :class="['text-sm', TEXT_MUTED_CLASS]">
      {{
        t('workouts.detail.plannedSets', {
          sets: exercise.sets,
          reps: exercise.reps,
          weight:
            exercise.weight !== null && exercise.weight > 0
              ? formatWeight(exercise.weight)
              : t('workouts.detail.bodyweight'),
        })
      }}
    </p>

    <p
      v-if="showLiveSets && workoutStatus !== 'PLANNED'"
      :class="['mt-3 text-xs', TEXT_MUTED_CLASS]"
    >
      {{
        t('workouts.detail.completedSetsSummary', {
          completed: completedSets.length,
          total: exercise.workoutSets.length,
        })
      }}
    </p>
  </section>
</template>
