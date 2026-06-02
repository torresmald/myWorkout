<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import WorkoutExercises from '@/components/WorkoutExercises.vue'
import type {
  DraftWorkoutExercise,
  WorkoutCreateResult,
  WorkoutPublic,
} from '@/interfaces/workout.interface'
import {
  BTN_ACTIONS_CLASS,
  BTN_MOBILE_FULL_CLASS,
  BTN_PRIMARY_CLASS,
  BTN_SECONDARY_CLASS,
  CARD_BODY_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  SECTION_TITLE_CLASS,
  TEXT_MUTED_CLASS,
} from '@/constants/ui.constants'
import { useToastStore } from '@/stores/toast.store'
import { useTemplateStore } from '@/stores/template.store'
import { useWorkoutStore } from '@/stores/workout.store'
import { dateInputToIso, isoToDateInputValue, todayDateInputValue } from '@/utils/date.util'
import { draftExercisesToCreateBody } from '@/utils/workout-draft.util'
import { workoutExercisesToTemplateExercises } from '@/utils/template-workout.util'
import { getErrorMessage } from '@/utils/error.util'
import { useModalStore } from '@/stores/modal.store'

const workoutStore = useWorkoutStore()
const templateStore = useTemplateStore()
const modalStore = useModalStore()
const toastStore = useToastStore()
const { t } = useI18n()

const { creating, updating, exercises, activeWorkoutId } = storeToRefs(workoutStore)

const savingAsTemplate = ref(false)

const formAnchorRef = useTemplateRef<HTMLElement>('formAnchor')

const editingId = ref<number | null>(null)
const name = ref('')
const date = ref(todayDateInputValue())
const notes = ref('')
const draftExercises = ref<DraftWorkoutExercise[]>([])

const isEditing = computed(() => editingId.value !== null)
const saving = computed(() => (isEditing.value ? updating.value : creating.value))
const createButtonLabel = computed(() =>
  draftExercises.value.length > 0
    ? t('workouts.form.createWithExercises', { count: draftExercises.value.length })
    : t('workouts.form.createButton'),
)

const canSaveAsTemplate = computed(
  () =>
    isEditing.value &&
    editingId.value !== null &&
    activeWorkoutId.value === editingId.value &&
    exercises.value.length > 0,
)

function resetForm() {
  editingId.value = null
  name.value = ''
  date.value = todayDateInputValue()
  notes.value = ''
  draftExercises.value = []
  workoutStore.clearExercises()
}

function startEdit(workout: WorkoutPublic) {
  editingId.value = workout.id
  name.value = workout.name
  date.value = isoToDateInputValue(workout.date)
  notes.value = workout.notes ?? ''
  draftExercises.value = []
}

async function startEditWorkout(workout: WorkoutPublic) {
  startEdit(workout)
  await scrollFormIntoView()
}

async function scrollFormIntoView() {
  await nextTick()
  formAnchorRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function openCreatedWorkout(created: WorkoutCreateResult) {
  editingId.value = created.id
  name.value = created.name
  date.value = isoToDateInputValue(created.date)
  notes.value = created.notes ?? ''
  draftExercises.value = []

  if (created.exercises?.length) {
    workoutStore.hydrateExercises(created.id, created.exercises)
  } else {
    workoutStore.hydrateExercises(created.id, [])
    await workoutStore.fetchExercises(created.id, true)
  }

  await scrollFormIntoView()
}

function validateForm(): boolean {
  const trimmedName = name.value.trim()

  if (!trimmedName) {
    toastStore.error(t('workouts.form.nameRequired'))
    return false
  }

  if (!date.value.trim()) {
    toastStore.error(t('workouts.form.dateRequired'))
    return false
  }

  name.value = trimmedName
  return true
}

async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  const body = {
    name: name.value,
    date: dateInputToIso(date.value),
    notes: notes.value.trim() || undefined,
  }

  try {
    if (isEditing.value && editingId.value !== null) {
      await workoutStore.update(editingId.value, body)
      toastStore.success(t('workouts.updateSuccess'))
    } else {
      const exerciseCount = draftExercises.value.length
      const exercises =
        exerciseCount > 0 ? draftExercisesToCreateBody(draftExercises.value) : undefined

      const created = await workoutStore.create({
        ...body,
        exercises,
      })

      await openCreatedWorkout(created)

      toastStore.success(
        exerciseCount > 0
          ? t('workouts.createWithExercisesSuccess', { count: exerciseCount })
          : t('workouts.createAndEditSuccess'),
      )
    }
  } catch (e) {
    toastStore.error(
      getErrorMessage(
        e,
        isEditing.value ? t('workouts.updateError') : t('workouts.createError'),
      ),
    )
  }
}

async function handleStartNewWorkout() {
  resetForm()
  await scrollFormIntoView()
}

async function handleSaveAsTemplate() {
  if (!canSaveAsTemplate.value) {
    toastStore.error(t('workouts.saveAsTemplateNoExercises'))
    return
  }

  const confirmed = await modalStore.confirm({
    title: t('modals.saveAsTemplate.title'),
    message: t('modals.saveAsTemplate.message', { name: name.value }),
    confirmLabel: t('workouts.form.saveAsTemplate'),
  })

  if (!confirmed) {
    return
  }

  savingAsTemplate.value = true

  try {
    await templateStore.create({
      name: name.value.trim(),
      description: notes.value.trim() || undefined,
      exercises: workoutExercisesToTemplateExercises(exercises.value),
    })
    toastStore.success(t('workouts.saveAsTemplateSuccess'))
  } catch (e) {
    toastStore.error(getErrorMessage(e, t('workouts.saveAsTemplateError')))
  } finally {
    savingAsTemplate.value = false
  }
}

const editingWorkoutId = computed(() => editingId.value)

defineExpose({
  startEdit: startEditWorkout,
  resetForm,
  editingWorkoutId,
})
</script>

<template>
  <div ref="formAnchorRef" class="scroll-mt-20">
    <section :class="CARD_BODY_CLASS">
      <h2 :class="SECTION_TITLE_CLASS">
        {{ isEditing ? t('workouts.form.editTitle') : t('workouts.form.newTitle') }}
      </h2>

      <p v-if="isEditing" :class="['mb-4', TEXT_MUTED_CLASS]">
        {{ t('workouts.form.editingHint') }}
      </p>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="workout-name" :class="LABEL_CLASS">{{ t('common.name') }}</label>
          <input
            id="workout-name"
            v-model="name"
            type="text"
            required
            autocomplete="off"
            :class="INPUT_CLASS"
            :placeholder="t('workouts.form.namePlaceholder')"
          />
        </div>

        <div>
          <label for="workout-date" :class="LABEL_CLASS">{{ t('common.date') }}</label>
          <input id="workout-date" v-model="date" type="date" required :class="INPUT_CLASS" />
        </div>

        <div>
          <label for="workout-notes" :class="LABEL_CLASS">{{ t('common.notes') }}</label>
          <textarea
            id="workout-notes"
            v-model="notes"
            rows="3"
            :class="INPUT_CLASS"
            :placeholder="t('common.optional')"
          />
        </div>
      </form>
    </section>

    <WorkoutExercises v-if="isEditing && editingId !== null" :workout-id="editingId" />

    <WorkoutExercises v-else v-model:draft-exercises="draftExercises" />

    <section :class="CARD_BODY_CLASS">
      <div :class="BTN_ACTIONS_CLASS">
        <button
          type="button"
          :disabled="saving || !name.trim()"
          :class="[BTN_PRIMARY_CLASS, BTN_MOBILE_FULL_CLASS]"
          @click="handleSubmit"
        >
          {{
            saving
              ? isEditing
                ? t('common.saving')
                : t('common.creating')
              : isEditing
                ? t('common.saveChanges')
                : createButtonLabel
          }}
        </button>

        <button
          v-if="isEditing"
          type="button"
          :class="[BTN_SECONDARY_CLASS, BTN_MOBILE_FULL_CLASS]"
          @click="handleStartNewWorkout"
        >
          {{ t('workouts.form.newWorkoutButton') }}
        </button>

        <button
          v-if="canSaveAsTemplate"
          type="button"
          :disabled="savingAsTemplate"
          :class="[BTN_SECONDARY_CLASS, BTN_MOBILE_FULL_CLASS]"
          @click="handleSaveAsTemplate"
        >
          {{ t('workouts.form.saveAsTemplate') }}
        </button>
      </div>
    </section>
  </div>
</template>
