<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import PageContainer from '@/components/layout/PageContainer.vue'
import RoutePageHeader from '@/components/layout/RoutePageHeader.vue'
import ListItemIconActions from '@/components/ui/ListItemIconActions.vue'
import type { ExerciseTypePublic } from '@/interfaces/exercise-type.interface'
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
import { getErrorMessage } from '@/utils/error.util'

const exerciseTypeStore = useExerciseTypeStore()
const modalStore = useModalStore()
const toastStore = useToastStore()
const { t } = useI18n()
const { exerciseTypes, loading, creating, updating, deletingId } = storeToRefs(exerciseTypeStore)

const editingId = ref<number | null>(null)
const name = ref('')
const description = ref('')
const muscleGroup = ref('')

const isEditing = computed(() => editingId.value !== null)
const saving = computed(() => (isEditing.value ? updating.value : creating.value))

function resetForm() {
  editingId.value = null
  name.value = ''
  description.value = ''
  muscleGroup.value = ''
}

function startEdit(exercise: ExerciseTypePublic) {
  editingId.value = exercise.id
  name.value = exercise.name
  description.value = exercise.description ?? ''
  muscleGroup.value = exercise.muscleGroup ?? ''
}

onMounted(async () => {
  try {
    await exerciseTypeStore.fetchAll()
  } catch (e) {
    toastStore.error(getErrorMessage(e, t('exerciseTypes.loadError')))
  }
})

async function handleSubmit() {
  const body = {
    name: name.value,
    description: description.value || undefined,
    muscleGroup: muscleGroup.value || undefined,
  }

  try {
    if (isEditing.value && editingId.value !== null) {
      await exerciseTypeStore.update(editingId.value, body)
      toastStore.success(t('exerciseTypes.updateSuccess'))
    } else {
      await exerciseTypeStore.create(body)
      toastStore.success(t('exerciseTypes.createSuccess'))
    }

    resetForm()
  } catch (e) {
    toastStore.error(
      getErrorMessage(
        e,
        isEditing.value ? t('exerciseTypes.updateError') : t('exerciseTypes.createError'),
      ),
    )
  }
}

async function handleDelete(exercise: ExerciseTypePublic) {
  const confirmed = await modalStore.confirm({
    title: t('modals.deleteExerciseType.title'),
    message: t('modals.deleteExerciseType.message', { name: exercise.name }),
    confirmLabel: t('common.delete'),
    variant: 'danger',
  })

  if (!confirmed) {
    return
  }

  if (editingId.value === exercise.id) {
    resetForm()
  }

  try {
    await exerciseTypeStore.remove(exercise.id)
    toastStore.success(t('exerciseTypes.deleteSuccess'))
  } catch (e) {
    toastStore.error(getErrorMessage(e, t('exerciseTypes.deleteError')))
  }
}
</script>

<template>
  <PageContainer>
    <RoutePageHeader />

    <section :class="CARD_BODY_CLASS">
      <h2 :class="SECTION_TITLE_CLASS">
        {{ isEditing ? t('exerciseTypes.form.editTitle') : t('exerciseTypes.form.newTitle') }}
      </h2>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="name" :class="LABEL_CLASS">{{ t('common.name') }}</label>
          <input
            id="name"
            v-model="name"
            type="text"
            required
            :class="INPUT_CLASS"
            :placeholder="t('exerciseTypes.form.namePlaceholder')"
          />
        </div>

        <div>
          <label for="description" :class="LABEL_CLASS">{{ t('common.description') }}</label>
          <input
            id="description"
            v-model="description"
            type="text"
            :class="INPUT_CLASS"
            :placeholder="t('exerciseTypes.form.descriptionPlaceholder')"
          />
        </div>

        <div>
          <label for="muscleGroup" :class="LABEL_CLASS">{{ t('common.muscleGroup') }}</label>
          <input
            id="muscleGroup"
            v-model="muscleGroup"
            type="text"
            :class="INPUT_CLASS"
            :placeholder="t('exerciseTypes.form.muscleGroupPlaceholder')"
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
                  : t('exerciseTypes.form.createButton')
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

    <section :class="CARD_BODY_CLASS">
      <h2 :class="SECTION_TITLE_CLASS">{{ t('exerciseTypes.list.title') }}</h2>

      <p v-if="loading" class="text-sm text-text-muted">{{ t('exerciseTypes.list.loading') }}</p>

      <p v-else-if="exerciseTypes.length === 0" class="text-sm text-text-muted">
        {{ t('exerciseTypes.list.empty') }}
      </p>

      <ul v-else class="divide-y divide-border-default">
        <li
          v-for="exercise in exerciseTypes"
          :key="exercise.id"
          :class="[
            LIST_ITEM_ROW_CLASS,
            { 'rounded-lg bg-nav-active-bg px-3 -mx-3': editingId === exercise.id },
          ]"
        >
          <div :class="LIST_ITEM_CONTENT_CLASS">
            <p class="font-medium text-text-primary">{{ exercise.name }}</p>
            <p v-if="exercise.description" class="text-sm text-text-muted">
              {{ exercise.description }}
            </p>
            <span
              v-if="exercise.muscleGroup"
              class="mt-1 inline-flex w-fit rounded-full bg-bg-muted px-2.5 py-0.5 text-xs font-medium text-text-secondary"
            >
              {{ exercise.muscleGroup }}
            </span>
          </div>

          <ListItemIconActions
            :deleting="deletingId === exercise.id"
            @edit="startEdit(exercise)"
            @delete="handleDelete(exercise)"
          />
        </li>
      </ul>
    </section>
  </PageContainer>
</template>
