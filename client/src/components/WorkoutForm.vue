<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import WorkoutExercises from '@/components/WorkoutExercises.vue'
import type { WorkoutPublic } from '@/interfaces/workout.interface'
import {
  BTN_ACTIONS_CLASS,
  BTN_MOBILE_FULL_CLASS,
  BTN_PRIMARY_CLASS,
  BTN_SECONDARY_CLASS,
  CARD_BODY_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  SECTION_TITLE_CLASS,
} from '@/constants/ui.constants'
import { useToastStore } from '@/stores/toast.store'
import { useWorkoutStore } from '@/stores/workout.store'
import { dateInputToIso, isoToDateInputValue, todayDateInputValue } from '@/utils/date.util'
import { getErrorMessage } from '@/utils/error.util'

const workoutStore = useWorkoutStore()
const toastStore = useToastStore()
const { t } = useI18n()

const { creating, updating } = storeToRefs(workoutStore)

const editingId = ref<number | null>(null)
const name = ref('')
const date = ref(todayDateInputValue())
const notes = ref('')

const isEditing = computed(() => editingId.value !== null)
const saving = computed(() => (isEditing.value ? updating.value : creating.value))

function resetForm() {
  editingId.value = null
  name.value = ''
  date.value = todayDateInputValue()
  notes.value = ''
  workoutStore.clearExercises()
}

function startEdit(workout: WorkoutPublic) {
  editingId.value = workout.id
  name.value = workout.name
  date.value = isoToDateInputValue(workout.date)
  notes.value = workout.notes ?? ''
}

async function handleSubmit() {
  const body = {
    name: name.value,
    date: dateInputToIso(date.value),
    notes: notes.value || undefined,
  }

  try {
    if (isEditing.value && editingId.value !== null) {
      await workoutStore.update(editingId.value, body)
      toastStore.success(t('workouts.updateSuccess'))
    } else {
      await workoutStore.create(body)
      toastStore.success(t('workouts.createSuccess'))
      resetForm()
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

const editingWorkoutId = computed(() => editingId.value)

defineExpose({
  startEdit,
  resetForm,
  editingWorkoutId,
})
</script>

<template>
  <section :class="CARD_BODY_CLASS">
    <h2 :class="SECTION_TITLE_CLASS">
      {{ isEditing ? t('workouts.form.editTitle') : t('workouts.form.newTitle') }}
    </h2>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label for="workout-name" :class="LABEL_CLASS">{{ t('common.name') }}</label>
        <input
          id="workout-name"
          v-model="name"
          type="text"
          required
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

      <div :class="BTN_ACTIONS_CLASS">
        <button
          type="submit"
          :disabled="saving"
          :class="[BTN_PRIMARY_CLASS, BTN_MOBILE_FULL_CLASS]"
        >
          {{
            saving
              ? isEditing
                ? t('common.saving')
                : t('common.creating')
              : isEditing
                ? t('common.saveChanges')
                : t('workouts.form.createButton')
          }}
        </button>

        <button
          v-if="isEditing"
          type="button"
          :class="[BTN_SECONDARY_CLASS, BTN_MOBILE_FULL_CLASS]"
          @click="resetForm"
        >
          {{ t('common.cancel') }}
        </button>
      </div>
    </form>
  </section>

  <WorkoutExercises v-if="editingId !== null" :workout-id="editingId" />
</template>
