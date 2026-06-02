<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import TemplateExercises from '@/components/TemplateExercises.vue'
import type { DraftWorkoutExercise } from '@/interfaces/workout.interface'
import type {
  TemplateCreateResult,
  WorkoutTemplatePublic,
} from '@/interfaces/template.interface'
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
import { useTemplateStore } from '@/stores/template.store'
import { useToastStore } from '@/stores/toast.store'
import { draftExercisesToCreateBody } from '@/utils/workout-draft.util'
import { getErrorMessage } from '@/utils/error.util'

const templateStore = useTemplateStore()
const toastStore = useToastStore()
const { t } = useI18n()

const { creating, updating } = storeToRefs(templateStore)

const formAnchorRef = useTemplateRef<HTMLElement>('formAnchor')

const editingId = ref<number | null>(null)
const name = ref('')
const description = ref('')
const draftExercises = ref<DraftWorkoutExercise[]>([])

const isEditing = computed(() => editingId.value !== null)
const saving = computed(() => (isEditing.value ? updating.value : creating.value))
const createButtonLabel = computed(() =>
  draftExercises.value.length > 0
    ? t('templates.form.createWithExercises', { count: draftExercises.value.length })
    : t('templates.form.createButton'),
)

function resetForm() {
  editingId.value = null
  name.value = ''
  description.value = ''
  draftExercises.value = []
  templateStore.clearExercises()
}

async function startEdit(template: WorkoutTemplatePublic) {
  editingId.value = template.id
  name.value = template.name
  description.value = template.description ?? ''
  draftExercises.value = []
  await scrollFormIntoView()
}

async function scrollFormIntoView() {
  await nextTick()
  formAnchorRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function openCreatedTemplate(created: TemplateCreateResult) {
  editingId.value = created.id
  name.value = created.name
  description.value = created.description ?? ''
  draftExercises.value = []

  if (created.exercises?.length) {
    templateStore.hydrateExercises(created.id, created.exercises)
  } else {
    templateStore.hydrateExercises(created.id, [])
    await templateStore.fetchExercises(created.id, true)
  }

  await scrollFormIntoView()
}

function validateForm(): boolean {
  const trimmedName = name.value.trim()

  if (!trimmedName) {
    toastStore.error(t('templates.form.nameRequired'))
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
    description: description.value.trim() || undefined,
  }

  try {
    if (isEditing.value && editingId.value !== null) {
      await templateStore.update(editingId.value, body)
      toastStore.success(t('templates.updateSuccess'))
    } else {
      const exerciseCount = draftExercises.value.length
      const exercises =
        exerciseCount > 0 ? draftExercisesToCreateBody(draftExercises.value) : undefined

      const created = await templateStore.create({
        ...body,
        exercises,
      })

      await openCreatedTemplate(created)

      toastStore.success(
        exerciseCount > 0
          ? t('templates.createWithExercisesSuccess', { count: exerciseCount })
          : t('templates.createAndEditSuccess'),
      )
    }
  } catch (e) {
    toastStore.error(
      getErrorMessage(
        e,
        isEditing.value ? t('templates.updateError') : t('templates.createError'),
      ),
    )
  }
}

async function handleStartNewTemplate() {
  resetForm()
  await scrollFormIntoView()
}

const editingTemplateId = computed(() => editingId.value)

defineExpose({
  startEdit,
  resetForm,
  editingTemplateId,
})
</script>

<template>
  <div ref="formAnchorRef" class="scroll-mt-20">
    <section :class="CARD_BODY_CLASS">
      <h2 :class="SECTION_TITLE_CLASS">
        {{ isEditing ? t('templates.form.editTitle') : t('templates.form.newTitle') }}
      </h2>

      <p v-if="isEditing" :class="['mb-4', TEXT_MUTED_CLASS]">
        {{ t('templates.form.editingHint') }}
      </p>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="template-name" :class="LABEL_CLASS">{{ t('common.name') }}</label>
          <input
            id="template-name"
            v-model="name"
            type="text"
            required
            autocomplete="off"
            :class="INPUT_CLASS"
            :placeholder="t('templates.form.namePlaceholder')"
          />
        </div>

        <div>
          <label for="template-description" :class="LABEL_CLASS">{{ t('common.description') }}</label>
          <textarea
            id="template-description"
            v-model="description"
            rows="3"
            :class="INPUT_CLASS"
            :placeholder="t('common.optional')"
          />
        </div>
      </form>
    </section>

    <TemplateExercises v-if="isEditing && editingId !== null" :template-id="editingId" />

    <TemplateExercises v-else v-model:draft-exercises="draftExercises" />

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
          @click="handleStartNewTemplate"
        >
          {{ t('templates.form.newTemplateButton') }}
        </button>
      </div>
    </section>
  </div>
</template>
