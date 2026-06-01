<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import EmptyState from '@/components/ui/EmptyState.vue'
import ListItemIconActions from '@/components/ui/ListItemIconActions.vue'
import SkeletonList from '@/components/ui/SkeletonList.vue'
import RestTimerModal from '@/components/workout/RestTimerModal.vue'
import { useRestTimer } from '@/composables/useRestTimer'
import type { WorkoutExercisePublic } from '@/interfaces/workout.interface'
import {
  BTN_ACTIONS_CLASS,
  BTN_MOBILE_FULL_CLASS,
  BTN_PRIMARY_CLASS,
  BTN_SECONDARY_CLASS,
  CARD_BODY_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  LIST_ITEM_CONTENT_CLASS,
  LIST_ITEM_ROW_CLASS,
  SECTION_TITLE_CLASS,
} from '@/constants/ui.constants'
import { useExerciseTypeStore } from '@/stores/exercise-type.store'
import { useModalStore } from '@/stores/modal.store'
import { useToastStore } from '@/stores/toast.store'
import { useWorkoutStore } from '@/stores/workout.store'
import { getErrorMessage } from '@/utils/error.util'

const props = defineProps<{
  workoutId: number
}>()

const workoutStore = useWorkoutStore()
const exerciseTypeStore = useExerciseTypeStore()
const modalStore = useModalStore()
const toastStore = useToastStore()
const { t } = useI18n()

const {
  isOpen: isRestTimerOpen,
  isPaused: isRestTimerPaused,
  isFinished: isRestTimerFinished,
  exerciseName: restTimerExerciseName,
  remainingSeconds: restTimerRemainingSeconds,
  totalSeconds: restTimerTotalSeconds,
  start: startRestTimer,
  togglePause: toggleRestTimerPause,
  cancel: cancelRestTimer,
  closeAfterFinish: closeRestTimerAfterFinish,
} = useRestTimer()

const { exercises, loadingExercises, creatingExercise, updatingExerciseId, deletingExerciseId } =
  storeToRefs(workoutStore)

const { exerciseTypes } = storeToRefs(exerciseTypeStore)

const exerciseEditingId = ref<number | null>(null)
const exerciseTypeId = ref<number | ''>('')
const sets = ref(3)
const reps = ref(10)
const restSeconds = ref(60)
const weight = ref<number | ''>('')
const sortOrder = ref(0)

const savingExercise = computed(() =>
  exerciseEditingId.value !== null ? updatingExerciseId.value !== null : creatingExercise.value,
)

function resetForm() {
  exerciseEditingId.value = null
  exerciseTypeId.value = ''
  sets.value = 3
  reps.value = 10
  restSeconds.value = 60
  weight.value = ''
  sortOrder.value = exercises.value.length
}

function startEditExercise(exercise: WorkoutExercisePublic) {
  exerciseEditingId.value = exercise.id
  exerciseTypeId.value = exercise.exerciseTypeId
  sets.value = exercise.sets
  reps.value = exercise.reps
  restSeconds.value = exercise.restSeconds
  weight.value = exercise.weight ?? ''
  sortOrder.value = exercise.sortOrder
}

function formatExerciseDetails(exercise: WorkoutExercisePublic): string {
  const parts = [`${exercise.sets} × ${exercise.reps}`]

  if (exercise.restSeconds > 0) {
    parts.push(t('workouts.exercises.restLabel', { seconds: exercise.restSeconds }))
  }

  if (exercise.weight !== null) {
    parts.push(`${exercise.weight} kg`)
  }

  return parts.join(' · ')
}

function buildExerciseBody() {
  return {
    exerciseTypeId: Number(exerciseTypeId.value),
    sets: sets.value,
    reps: reps.value,
    restSeconds: restSeconds.value,
    weight: weight.value === '' ? null : Number(weight.value),
    sortOrder: sortOrder.value,
  }
}

async function handleSubmit() {
  const body = buildExerciseBody()

  try {
    if (exerciseEditingId.value !== null) {
      await workoutStore.updateExercise(props.workoutId, exerciseEditingId.value, body)
      toastStore.success(t('workouts.exercises.updateSuccess'))
    } else {
      await workoutStore.createExercise(props.workoutId, body)
      toastStore.success(t('workouts.exercises.createSuccess'))
    }

    resetForm()
    sortOrder.value = exercises.value.length
  } catch (e) {
    toastStore.error(
      getErrorMessage(
        e,
        exerciseEditingId.value !== null
          ? t('workouts.exercises.updateError')
          : t('workouts.exercises.createError'),
      ),
    )
  }
}

function startExerciseRestTimer(exercise: WorkoutExercisePublic) {
  if (exercise.restSeconds <= 0) {
    return
  }

  startRestTimer(exercise.exerciseType.name, exercise.restSeconds)
}

async function handleDelete(exercise: WorkoutExercisePublic) {
  const confirmed = await modalStore.confirm({
    title: t('modals.deleteWorkoutExercise.title'),
    message: t('modals.deleteWorkoutExercise.message', { name: exercise.exerciseType.name }),
    confirmLabel: t('common.delete'),
    variant: 'danger',
  })

  if (!confirmed) {
    return
  }

  if (exerciseEditingId.value === exercise.id) {
    resetForm()
  }

  try {
    await workoutStore.removeExercise(props.workoutId, exercise.id)
    toastStore.success(t('workouts.exercises.deleteSuccess'))
    sortOrder.value = exercises.value.length
  } catch (e) {
    toastStore.error(getErrorMessage(e, t('workouts.exercises.deleteError')))
  }
}

watch(
  () => props.workoutId,
  async (workoutId) => {
    resetForm()

    try {
      await workoutStore.fetchExercises(workoutId)
      sortOrder.value = exercises.value.length
    } catch (e) {
      toastStore.error(getErrorMessage(e, t('workouts.exercises.loadError')))
    }
  },
  { immediate: true },
)

onMounted(async () => {
  try {
    await exerciseTypeStore.fetchAll()
  } catch (e) {
    toastStore.error(getErrorMessage(e, t('workouts.exercises.loadTypesError')))
  }
})

defineExpose({ resetForm })
</script>

<template>
  <section :class="CARD_BODY_CLASS">
    <h2 :class="SECTION_TITLE_CLASS">{{ t('workouts.exercises.title') }}</h2>

    <SkeletonList v-if="loadingExercises" class="mb-6" />

    <ul v-else-if="exercises.length > 0" class="mb-6 divide-y divide-border-default">
      <li
        v-for="(exercise, index) in exercises"
        :key="exercise.id"
        :class="[
          LIST_ITEM_ROW_CLASS,
          'stagger-item',
          { 'rounded-lg bg-nav-active-bg px-3 -mx-3': exerciseEditingId === exercise.id },
        ]"
        :style="{ animationDelay: `${index * 45}ms` }"
      >
        <div :class="LIST_ITEM_CONTENT_CLASS">
          <p class="font-medium text-text-primary">{{ exercise.exerciseType.name }}</p>
          <p class="text-sm text-text-muted">{{ formatExerciseDetails(exercise) }}</p>
          <span
            v-if="exercise.exerciseType.muscleGroup"
            class="mt-1 inline-flex w-fit rounded-full bg-bg-muted px-2.5 py-0.5 text-xs font-medium text-text-secondary"
          >
            {{ exercise.exerciseType.muscleGroup }}
          </span>
        </div>

        <ListItemIconActions
          :show-timer="exercise.restSeconds > 0"
          :deleting="deletingExerciseId === exercise.id"
          @timer="startExerciseRestTimer(exercise)"
          @edit="startEditExercise(exercise)"
          @delete="handleDelete(exercise)"
        />
      </li>
    </ul>

    <EmptyState
      v-else
      class="mb-6"
      variant="exercises"
      :title="t('empty.exercises.title')"
      :description="t('empty.exercises.description')"
    />

    <div
      v-if="exerciseTypes.length === 0"
      class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
    >
      {{ t('workouts.exercises.noTypesWarning') }}
      <RouterLink to="/exercise-types" class="ml-1 font-medium underline">
        {{ t('workouts.exercises.goToTypes') }}
      </RouterLink>
    </div>

    <form
      v-else
      class="space-y-4 border-t border-border-default pt-4"
      @submit.prevent="handleSubmit"
    >
      <h3 class="text-sm font-semibold text-text-primary">
        {{
          exerciseEditingId !== null
            ? t('workouts.exercises.editTitle')
            : t('workouts.exercises.addTitle')
        }}
      </h3>

      <div>
        <label for="exerciseTypeId" :class="LABEL_CLASS">{{ t('workouts.exercises.typeLabel') }}</label>
        <select id="exerciseTypeId" v-model="exerciseTypeId" required :class="INPUT_CLASS">
          <option disabled value="">{{ t('workouts.exercises.selectType') }}</option>
          <option v-for="type in exerciseTypes" :key="type.id" :value="type.id">
            {{ type.name }}
          </option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label for="sets" :class="LABEL_CLASS">{{ t('common.sets') }}</label>
          <input
            id="sets"
            v-model.number="sets"
            type="number"
            min="1"
            required
            :class="INPUT_CLASS"
          />
        </div>

        <div>
          <label for="reps" :class="LABEL_CLASS">{{ t('common.reps') }}</label>
          <input
            id="reps"
            v-model.number="reps"
            type="number"
            min="1"
            required
            :class="INPUT_CLASS"
          />
        </div>

        <div>
          <label for="restSeconds" :class="LABEL_CLASS">{{ t('common.restSeconds') }}</label>
          <input
            id="restSeconds"
            v-model.number="restSeconds"
            type="number"
            min="0"
            required
            :class="INPUT_CLASS"
          />
        </div>

        <div>
          <label for="weight" :class="LABEL_CLASS">{{ t('common.weightKg') }}</label>
          <input
            id="weight"
            v-model.number="weight"
            type="number"
            min="0"
            step="0.5"
            :class="INPUT_CLASS"
            :placeholder="t('common.optional')"
          />
        </div>
      </div>

      <div :class="BTN_ACTIONS_CLASS">
        <button
          type="submit"
          :disabled="savingExercise"
          :class="[BTN_PRIMARY_CLASS, BTN_MOBILE_FULL_CLASS]"
        >
          {{
            savingExercise
              ? exerciseEditingId !== null
                ? t('common.saving')
                : t('common.adding')
              : exerciseEditingId !== null
                ? t('workouts.exercises.saveButton')
                : t('workouts.exercises.addButton')
          }}
        </button>

        <button
          v-if="exerciseEditingId !== null"
          type="button"
          :class="[BTN_SECONDARY_CLASS, BTN_MOBILE_FULL_CLASS]"
          @click="resetForm"
        >
          {{ t('common.cancel') }}
        </button>
      </div>
    </form>
  </section>

  <RestTimerModal
    :open="isRestTimerOpen"
    :exercise-name="restTimerExerciseName"
    :remaining-seconds="restTimerRemainingSeconds"
    :total-seconds="restTimerTotalSeconds"
    :is-paused="isRestTimerPaused"
    :is-finished="isRestTimerFinished"
    @toggle-pause="toggleRestTimerPause"
    @cancel="cancelRestTimer"
    @close="closeRestTimerAfterFinish"
  />
</template>
