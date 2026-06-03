<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import ExerciseTechniqueModal from '@/components/exercise/ExerciseTechniqueModal.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import RoutePageHeader from '@/components/layout/RoutePageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import SkeletonList from '@/components/ui/SkeletonList.vue'
import type { ExerciseCatalogPublic, MuscleGroup } from '@/interfaces/exercise-catalog.interface'
import {
  BTN_MOBILE_FULL_CLASS,
  BTN_PRIMARY_CLASS,
  BTN_SECONDARY_CLASS,
  CARD_BODY_CLASS,
  TEXT_MUTED_CLASS,
} from '@/constants/ui.constants'
import { useExerciseCatalogStore } from '@/stores/exercise-catalog.store'
import { useLocaleStore } from '@/stores/locale.store'
import { useToastStore } from '@/stores/toast.store'
import {
  getCatalogDescription,
  getCatalogName,
} from '@/utils/catalog-localization.util'
import { getErrorMessage } from '@/utils/error.util'

const MUSCLE_GROUPS: MuscleGroup[] = [
  'CHEST',
  'BACK',
  'LEGS',
  'SHOULDERS',
  'ARMS',
  'CORE',
  'FULL_BODY',
]

const catalogStore = useExerciseCatalogStore()
const localeStore = useLocaleStore()
const toastStore = useToastStore()
const { t } = useI18n()

const { exercises, loading, importingId } = storeToRefs(catalogStore)
const { locale } = storeToRefs(localeStore)

const activeFilter = ref<MuscleGroup | null>(null)
const previewExercise = ref<ExerciseCatalogPublic | null>(null)

const previewName = computed(() =>
  previewExercise.value ? getCatalogName(previewExercise.value, locale.value) : '',
)

const previewDescription = computed(() =>
  previewExercise.value ? getCatalogDescription(previewExercise.value, locale.value) : null,
)

const filterOptions = computed(() => [
  { value: null, label: t('exerciseCatalog.filterAll') },
  ...MUSCLE_GROUPS.map((group) => ({
    value: group,
    label: t(`exerciseCatalog.muscleGroups.${group}`),
  })),
])

onMounted(async () => {
  try {
    await catalogStore.fetchAll()
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('exerciseCatalog.loadError')))
  }
})

async function handleFilterChange(group: MuscleGroup | null) {
  activeFilter.value = group

  try {
    await catalogStore.fetchAll(group)
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('exerciseCatalog.loadError')))
  }
}

async function handleImport(exercise: ExerciseCatalogPublic) {
  if (exercise.imported) {
    return
  }

  try {
    await catalogStore.importExercise(exercise.id)
    toastStore.success(t('exerciseCatalog.importSuccess'))
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('exerciseCatalog.importError')))
  }
}

function openPreview(exercise: ExerciseCatalogPublic) {
  previewExercise.value = exercise
}

function closePreview() {
  previewExercise.value = null
}
</script>

<template>
  <PageContainer>
    <RoutePageHeader />

    <section :class="[CARD_BODY_CLASS, 'mb-4']">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="option in filterOptions"
          :key="option.label"
          type="button"
          :class="[
            'rounded-full px-3 py-1.5 text-sm font-medium transition',
            activeFilter === option.value
              ? 'bg-blue-600 text-white'
              : 'bg-bg-muted text-text-secondary hover:bg-nav-active-bg',
          ]"
          @click="handleFilterChange(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </section>

    <SkeletonList v-if="loading && exercises.length === 0" />

    <EmptyState
      v-else-if="!loading && exercises.length === 0"
      variant="exercise-types"
      :title="t('exerciseCatalog.empty')"
      :description="t('exerciseCatalog.description')"
    />

    <section v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="(exercise, index) in exercises"
        :key="exercise.id"
        :class="[CARD_BODY_CLASS, 'stagger-item flex flex-col']"
        :style="{ animationDelay: `${index * 40}ms` }"
      >
        <button
          type="button"
          class="mb-3 overflow-hidden rounded-lg bg-bg-muted"
          @click="openPreview(exercise)"
        >
          <img
            v-if="exercise.mediaUrl"
            :src="exercise.mediaUrl"
            :alt="getCatalogName(exercise, locale)"
            class="aspect-video w-full object-cover"
          />
          <div
            v-else
            class="flex aspect-video items-center justify-center text-sm text-text-muted"
          >
            {{ t('exerciseCatalog.noMedia') }}
          </div>
        </button>

        <div class="flex flex-1 flex-col">
          <h2 class="text-base font-semibold text-text-primary">
            {{ getCatalogName(exercise, locale) }}
          </h2>
          <p :class="['mt-1 text-xs', TEXT_MUTED_CLASS]">
            {{ t(`exerciseCatalog.muscleGroups.${exercise.muscleGroup}`) }}
          </p>
          <p
            v-if="getCatalogDescription(exercise, locale)"
            :class="['mt-2 line-clamp-2 text-sm', TEXT_MUTED_CLASS]"
          >
            {{ getCatalogDescription(exercise, locale) }}
          </p>

          <div class="mt-4 flex flex-col gap-2">
            <button
              v-if="exercise.mediaUrl"
              type="button"
              :class="[BTN_SECONDARY_CLASS, BTN_MOBILE_FULL_CLASS]"
              @click="openPreview(exercise)"
            >
              {{ t('exerciseCatalog.viewTechnique') }}
            </button>

            <LoadingButton
              type="button"
              :loading="importingId === exercise.id"
              :disabled="exercise.imported"
              :class="[
                exercise.imported ? BTN_SECONDARY_CLASS : BTN_PRIMARY_CLASS,
                BTN_MOBILE_FULL_CLASS,
              ]"
              @click="handleImport(exercise)"
            >
              {{
                exercise.imported
                  ? t('exerciseCatalog.importedButton')
                  : t('exerciseCatalog.importButton')
              }}
            </LoadingButton>
          </div>
        </div>
      </article>
    </section>

    <ExerciseTechniqueModal
      :open="!!previewExercise"
      :exercise-name="previewName"
      :description="previewDescription"
      :media-type="previewExercise?.mediaType"
      :media-url="previewExercise?.mediaUrl"
      @close="closePreview"
    />
  </PageContainer>
</template>
