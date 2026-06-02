<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import ExerciseTechniqueModal from '@/components/exercise/ExerciseTechniqueModal.vue'
import WorkoutSetRow from '@/components/workout/WorkoutSetRow.vue'
import { BTN_SECONDARY_CLASS, CARD_COMPACT_CLASS, TEXT_HEADING_CLASS } from '@/constants/ui.constants'
import type { WorkoutSessionExercise } from '@/interfaces/workout-set.interface'

const props = defineProps<{
  exercise: WorkoutSessionExercise
  updatingSetKey: string | null
  personalRecordSetKeys: Set<string>
}>()

const emit = defineEmits<{
  toggleComplete: [
    payload: {
      exerciseId: number
      setNumber: number
      reps: number
      weight: number | null
      completed: boolean
      restSeconds: number
      isLastSet: boolean
      exerciseName: string
    },
  ]
}>()

const { t } = useI18n()

const showTechnique = ref(false)

const mediaUrl = computed(() => props.exercise.exerciseType.catalogExercise?.mediaUrl ?? null)
const mediaType = computed(() => props.exercise.exerciseType.catalogExercise?.mediaType ?? null)
const hasTechnique = computed(() => Boolean(mediaUrl.value))

function setKey(exerciseId: number, setNumber: number) {
  return `${exerciseId}-${setNumber}`
}

function handleToggleComplete(
  setNumber: number,
  payload: { reps: number; weight: number | null; completed: boolean },
) {
  emit('toggleComplete', {
    exerciseId: props.exercise.id,
    setNumber,
    reps: payload.reps,
    weight: payload.weight,
    completed: payload.completed,
    restSeconds: props.exercise.restSeconds,
    isLastSet: setNumber === props.exercise.workoutSets.length,
    exerciseName: props.exercise.exerciseType.name,
  })
}
</script>

<template>
  <section :class="CARD_COMPACT_CLASS">
    <div class="mb-3 flex flex-wrap items-start justify-between gap-2">
      <div>
        <p :class="TEXT_HEADING_CLASS">{{ exercise.exerciseType.name }}</p>
        <span
          v-if="exercise.exerciseType.muscleGroup"
          class="mt-1 inline-flex w-fit rounded-full bg-bg-muted px-2.5 py-0.5 text-xs font-medium text-text-secondary"
        >
          {{ exercise.exerciseType.muscleGroup }}
        </span>
      </div>

      <button
        v-if="hasTechnique"
        type="button"
        :class="[BTN_SECONDARY_CLASS, 'shrink-0 text-xs']"
        @click="showTechnique = true"
      >
        {{ t('exerciseCatalog.viewTechnique') }}
      </button>
    </div>

    <div class="space-y-2">
      <WorkoutSetRow
        v-for="set in exercise.workoutSets"
        :key="set.id"
        :set="set"
        :saving="updatingSetKey === setKey(exercise.id, set.setNumber)"
        :show-personal-record="personalRecordSetKeys.has(setKey(exercise.id, set.setNumber))"
        @toggle-complete="handleToggleComplete(set.setNumber, $event)"
      />
    </div>

    <p v-if="exercise.restSeconds > 0" class="mt-3 text-xs text-text-muted">
      {{ t('workouts.exercises.restLabel', { seconds: exercise.restSeconds }) }}
    </p>

    <ExerciseTechniqueModal
      :open="showTechnique"
      :exercise-name="exercise.exerciseType.name"
      :media-type="mediaType"
      :media-url="mediaUrl"
      @close="showTechnique = false"
    />
  </section>
</template>
