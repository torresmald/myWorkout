<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'

import PageContainer from '@/components/layout/PageContainer.vue'
import RoutePageHeader from '@/components/layout/RoutePageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ListItemIconActions from '@/components/ui/ListItemIconActions.vue'
import SkeletonList from '@/components/ui/SkeletonList.vue'
import type { ExerciseTypePublic } from '@/interfaces/exercise-type.interface'
import {
  BTN_ACTIONS_CLASS,
  BTN_ICON_GHOST_CLASS,
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
import { usePersonalRecordStore } from '@/stores/personal-record.store'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/utils/error.util'

const exerciseTypeStore = useExerciseTypeStore()
const personalRecordStore = usePersonalRecordStore()
const modalStore = useModalStore()
const toastStore = useToastStore()
const router = useRouter()
const { t } = useI18n()
const { exerciseTypes, loading, creating, updating, deletingId } = storeToRefs(exerciseTypeStore)
const { records: personalRecords } = storeToRefs(personalRecordStore)

const recordByExerciseId = computed(() => {
  const map = new Map<number, (typeof personalRecords.value)[number]>()

  for (const record of personalRecords.value) {
    map.set(record.exerciseTypeId, record)
  }

  return map
})

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
    await Promise.all([exerciseTypeStore.fetchAll(), personalRecordStore.fetchAll()])
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

function handleViewHistory(exercise: ExerciseTypePublic) {
  void router.push({ name: 'exercise-history', params: { id: String(exercise.id) } })
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
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 :class="SECTION_TITLE_CLASS">{{ t('exerciseTypes.list.title') }}</h2>
        <RouterLink
          :to="{ name: 'exercise-catalog' }"
          :class="[BTN_SECONDARY_CLASS, BTN_MOBILE_FULL_CLASS, 'inline-flex']"
        >
          {{ t('exerciseTypes.list.browseCatalog') }}
        </RouterLink>
      </div>

      <SkeletonList v-if="loading" />

      <EmptyState
        v-else-if="exerciseTypes.length === 0"
        variant="exercise-types"
        :title="t('empty.exerciseTypes.title')"
        :description="t('empty.exerciseTypes.description')"
      />

      <ul v-else class="divide-y divide-border-default">
        <li
          v-for="(exercise, index) in exerciseTypes"
          :key="exercise.id"
          :class="[
            LIST_ITEM_ROW_CLASS,
            'stagger-item',
            { 'rounded-lg bg-nav-active-bg px-3 -mx-3': editingId === exercise.id },
          ]"
          :style="{ animationDelay: `${index * 45}ms` }"
        >
          <div :class="LIST_ITEM_CONTENT_CLASS">
            <p class="font-medium text-text-primary">{{ exercise.name }}</p>
            <p v-if="exercise.description" class="text-sm text-text-muted">
              {{ exercise.description }}
            </p>
            <p
              v-if="recordByExerciseId.get(exercise.id)"
              class="mt-1 text-sm font-medium text-amber-700 dark:text-amber-300"
            >
              {{
                t('personalRecords.repsAtWeight', {
                  reps: recordByExerciseId.get(exercise.id)!.reps,
                  weight: recordByExerciseId.get(exercise.id)!.maxWeight,
                })
              }}
              · {{ t('personalRecords.badge') }}
            </p>
            <span
              v-if="exercise.muscleGroup"
              class="mt-1 inline-flex w-fit rounded-full bg-bg-muted px-2.5 py-0.5 text-xs font-medium text-text-secondary"
            >
              {{ exercise.muscleGroup }}
            </span>
          </div>

          <div class="flex shrink-0 items-center gap-1">
            <button
              type="button"
              :class="BTN_ICON_GHOST_CLASS"
              :aria-label="t('exerciseHistory.viewHistory')"
              @click="handleViewHistory(exercise)"
            >
              <svg
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
                <path d="M3 3v18h18" />
                <path d="M7 16V9" />
                <path d="M12 16V5" />
                <path d="M17 16v-3" />
              </svg>
            </button>

            <ListItemIconActions
              :deleting="deletingId === exercise.id"
              @edit="startEdit(exercise)"
              @delete="handleDelete(exercise)"
            />
          </div>
        </li>
      </ul>
    </section>
  </PageContainer>
</template>
