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
import type { DraftWorkoutExercise } from '@/interfaces/workout.interface'
import type { TemplateExercisePublic } from '@/interfaces/template.interface'
import { useWeightDisplay } from '@/composables/useWeightDisplay'
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
import { useTemplateStore } from '@/stores/template.store'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/utils/error.util'
import {
  createDraftExercise,
  updateDraftExercise,
} from '@/utils/workout-draft.util'

const props = defineProps<{
  templateId?: number
}>()

const draftExercises = defineModel<DraftWorkoutExercise[]>('draftExercises', {
  default: () => [],
})

const isDraftMode = computed(() => props.templateId === undefined)

const templateStore = useTemplateStore()
const exerciseTypeStore = useExerciseTypeStore()
const modalStore = useModalStore()
const toastStore = useToastStore()
const { t } = useI18n()
const { formatWeight, weightFieldLabel, inputBounds, toDisplayValue, toKg } = useWeightDisplay()

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
  storeToRefs(templateStore)

const { exerciseTypes } = storeToRefs(exerciseTypeStore)

const exerciseEditingKey = ref<number | string | null>(null)
const exerciseTypeId = ref<number | ''>('')
const sets = ref(3)
const reps = ref(10)
const restSeconds = ref(60)
const weight = ref<number | ''>('')
const sortOrder = ref(0)
const savingDraftExercise = ref(false)

const listLength = computed(() =>
  isDraftMode.value ? draftExercises.value.length : exercises.value.length,
)

const savingExercise = computed(() => {
  if (isDraftMode.value) {
    return savingDraftExercise.value
  }

  return exerciseEditingKey.value !== null
    ? updatingExerciseId.value !== null
    : creatingExercise.value
})

function resetForm() {
  exerciseEditingKey.value = null
  exerciseTypeId.value = ''
  sets.value = 3
  reps.value = 10
  restSeconds.value = 60
  weight.value = ''
  sortOrder.value = listLength.value
}

function startEditExercise(exercise: TemplateExercisePublic | DraftWorkoutExercise) {
  exerciseEditingKey.value = 'localId' in exercise ? exercise.localId : exercise.id
  exerciseTypeId.value = exercise.exerciseTypeId
  sets.value = exercise.sets
  reps.value = exercise.reps
  restSeconds.value = exercise.restSeconds
  weight.value = exercise.weight !== null ? toDisplayValue(exercise.weight) : ''
  sortOrder.value = exercise.sortOrder
}

function formatExerciseDetails(
  exercise: Pick<TemplateExercisePublic, 'sets' | 'reps' | 'restSeconds' | 'weight'>,
): string {
  const parts = [`${exercise.sets} × ${exercise.reps}`]

  if (exercise.restSeconds > 0) {
    parts.push(t('templates.exercises.restLabel', { seconds: exercise.restSeconds }))
  }

  if (exercise.weight !== null) {
    parts.push(formatWeight(exercise.weight))
  }

  return parts.join(' · ')
}

function buildExerciseBody() {
  return {
    exerciseTypeId: Number(exerciseTypeId.value),
    sets: sets.value,
    reps: reps.value,
    restSeconds: restSeconds.value,
    weight: weight.value === '' ? null : toKg(Number(weight.value)),
    sortOrder: sortOrder.value,
  }
}

function getSelectedExerciseType() {
  return exerciseTypes.value.find((type) => type.id === Number(exerciseTypeId.value)) ?? null
}

async function handleDraftSubmit() {
  const exerciseType = getSelectedExerciseType()

  if (!exerciseType) {
    return
  }

  savingDraftExercise.value = true

  try {
    const body = buildExerciseBody()

    if (typeof exerciseEditingKey.value === 'string') {
      draftExercises.value = draftExercises.value.map((exercise) =>
        exercise.localId === exerciseEditingKey.value
          ? updateDraftExercise(exercise, body, exerciseType)
          : exercise,
      )
      toastStore.success(t('templates.exercises.updateSuccess'))
    } else {
      draftExercises.value = [...draftExercises.value, createDraftExercise(body, exerciseType)]
      toastStore.success(t('templates.exercises.createSuccess'))
    }

    resetForm()
    sortOrder.value = draftExercises.value.length
  } finally {
    savingDraftExercise.value = false
  }
}

async function handlePersistedSubmit() {
  if (props.templateId === undefined) {
    return
  }

  const body = buildExerciseBody()

  try {
    if (typeof exerciseEditingKey.value === 'number') {
      await templateStore.updateExercise(props.templateId, exerciseEditingKey.value, body)
      toastStore.success(t('templates.exercises.updateSuccess'))
    } else {
      await templateStore.createExercise(props.templateId, body)
      toastStore.success(t('templates.exercises.createSuccess'))
    }

    resetForm()
    sortOrder.value = exercises.value.length
  } catch (e) {
    toastStore.error(
      getErrorMessage(
        e,
        typeof exerciseEditingKey.value === 'number'
          ? t('templates.exercises.updateError')
          : t('templates.exercises.createError'),
      ),
    )
  }
}

async function handleSubmit() {
  if (isDraftMode.value) {
    await handleDraftSubmit()
    return
  }

  await handlePersistedSubmit()
}

function startExerciseRestTimer(
  exercise: Pick<TemplateExercisePublic, 'restSeconds' | 'exerciseType'>,
) {
  if (exercise.restSeconds <= 0) {
    return
  }

  startRestTimer(exercise.exerciseType.name, exercise.restSeconds)
}

async function handleDeletePersisted(exercise: TemplateExercisePublic) {
  if (props.templateId === undefined) {
    return
  }

  const confirmed = await modalStore.confirm({
    title: t('modals.deleteTemplateExercise.title'),
    message: t('modals.deleteTemplateExercise.message', { name: exercise.exerciseType.name }),
    confirmLabel: t('common.delete'),
    variant: 'danger',
  })

  if (!confirmed) {
    return
  }

  if (exerciseEditingKey.value === exercise.id) {
    resetForm()
  }

  try {
    await templateStore.removeExercise(props.templateId, exercise.id)
    toastStore.success(t('templates.exercises.deleteSuccess'))
    sortOrder.value = exercises.value.length
  } catch (e) {
    toastStore.error(getErrorMessage(e, t('templates.exercises.deleteError')))
  }
}

async function handleDeleteDraft(exercise: DraftWorkoutExercise) {
  const confirmed = await modalStore.confirm({
    title: t('modals.deleteTemplateExercise.title'),
    message: t('modals.deleteTemplateExercise.message', { name: exercise.exerciseType.name }),
    confirmLabel: t('common.delete'),
    variant: 'danger',
  })

  if (!confirmed) {
    return
  }

  if (exerciseEditingKey.value === exercise.localId) {
    resetForm()
  }

  draftExercises.value = draftExercises.value.filter((item) => item.localId !== exercise.localId)
  sortOrder.value = draftExercises.value.length
  toastStore.success(t('templates.exercises.deleteSuccess'))
}

function isExerciseEditing(exercise: TemplateExercisePublic | DraftWorkoutExercise): boolean {
  const key = 'localId' in exercise ? exercise.localId : exercise.id
  return exerciseEditingKey.value === key
}

watch(
  () => props.templateId,
  async (templateId) => {
    if (templateId === undefined) {
      resetForm()
      sortOrder.value = draftExercises.value.length
      return
    }

    resetForm()

    if (
      templateStore.activeTemplateId === templateId &&
      exercises.value.length > 0 &&
      !templateStore.loadingExercises
    ) {
      sortOrder.value = exercises.value.length
      return
    }

    try {
      await templateStore.fetchExercises(templateId)
      sortOrder.value = exercises.value.length
    } catch (e) {
      toastStore.error(getErrorMessage(e, t('templates.exercises.loadError')))
    }
  },
  { immediate: true },
)

onMounted(async () => {
  try {
    await exerciseTypeStore.fetchAll()
  } catch (e) {
    toastStore.error(getErrorMessage(e, t('templates.exercises.loadTypesError')))
  }
})

defineExpose({ resetForm })
</script>

<template>
  <section :class="CARD_BODY_CLASS">
    <h2 :class="SECTION_TITLE_CLASS">
      {{ isDraftMode ? t('templates.exercises.draftTitle') : t('templates.exercises.title') }}
    </h2>

    <SkeletonList v-if="!isDraftMode && loadingExercises" class="mb-6" />

    <ul
      v-else-if="isDraftMode ? draftExercises.length > 0 : exercises.length > 0"
      class="mb-6 divide-y divide-border-default"
    >
      <template v-if="isDraftMode">
        <li
          v-for="(exercise, index) in draftExercises"
          :key="exercise.localId"
          :class="[
            LIST_ITEM_ROW_CLASS,
            'stagger-item',
            { 'rounded-lg bg-nav-active-bg px-3 -mx-3': isExerciseEditing(exercise) },
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
            @timer="startExerciseRestTimer(exercise)"
            @edit="startEditExercise(exercise)"
            @delete="handleDeleteDraft(exercise)"
          />
        </li>
      </template>

      <template v-else>
        <li
          v-for="(exercise, index) in exercises"
          :key="exercise.id"
          :class="[
            LIST_ITEM_ROW_CLASS,
            'stagger-item',
            { 'rounded-lg bg-nav-active-bg px-3 -mx-3': isExerciseEditing(exercise) },
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
            @delete="handleDeletePersisted(exercise)"
          />
        </li>
      </template>
    </ul>

    <EmptyState
      v-else
      class="mb-6"
      variant="templates"
      :title="t('empty.templates.exercises.title')"
      :description="t('empty.templates.exercises.description')"
    />

    <div
      v-if="exerciseTypes.length === 0"
      class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
    >
      {{ t('templates.exercises.noTypesWarning') }}
      <RouterLink to="/exercise-types" class="ml-1 font-medium underline">
        {{ t('templates.exercises.goToTypes') }}
      </RouterLink>
    </div>

    <form
      v-else
      class="space-y-4 border-t border-border-default pt-4"
      @submit.prevent="handleSubmit"
    >
      <h3 class="text-sm font-semibold text-text-primary">
        {{
          exerciseEditingKey !== null
            ? t('templates.exercises.editTitle')
            : t('templates.exercises.addTitle')
        }}
      </h3>

      <div>
        <label for="template-exerciseTypeId" :class="LABEL_CLASS">
          {{ t('templates.exercises.typeLabel') }}
        </label>
        <select
          id="template-exerciseTypeId"
          v-model="exerciseTypeId"
          required
          :class="INPUT_CLASS"
        >
          <option disabled value="">{{ t('templates.exercises.selectType') }}</option>
          <option v-for="type in exerciseTypes" :key="type.id" :value="type.id">
            {{ type.name }}
          </option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label for="template-sets" :class="LABEL_CLASS">{{ t('common.sets') }}</label>
          <input
            id="template-sets"
            v-model.number="sets"
            type="number"
            min="1"
            required
            :class="INPUT_CLASS"
          />
        </div>

        <div>
          <label for="template-reps" :class="LABEL_CLASS">{{ t('common.reps') }}</label>
          <input
            id="template-reps"
            v-model.number="reps"
            type="number"
            min="1"
            required
            :class="INPUT_CLASS"
          />
        </div>

        <div>
          <label for="template-restSeconds" :class="LABEL_CLASS">{{ t('common.restSeconds') }}</label>
          <input
            id="template-restSeconds"
            v-model.number="restSeconds"
            type="number"
            min="0"
            required
            :class="INPUT_CLASS"
          />
        </div>

        <div>
          <label for="template-weight" :class="LABEL_CLASS">{{ weightFieldLabel }}</label>
          <input
            id="template-weight"
            v-model.number="weight"
            type="number"
            min="0"
            :step="inputBounds.step"
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
              ? exerciseEditingKey !== null
                ? t('common.saving')
                : t('common.adding')
              : exerciseEditingKey !== null
                ? t('templates.exercises.saveButton')
                : t('templates.exercises.addButton')
          }}
        </button>

        <button
          v-if="exerciseEditingKey !== null"
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
