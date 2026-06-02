<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import PageContainer from '@/components/layout/PageContainer.vue'
import RoutePageHeader from '@/components/layout/RoutePageHeader.vue'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import SkeletonList from '@/components/ui/SkeletonList.vue'
import type { AdminExerciseCatalogEntry } from '@/interfaces/admin-exercise-catalog.interface'
import type { CatalogMediaType, MuscleGroup } from '@/interfaces/exercise-catalog.interface'
import {
  BTN_MOBILE_FULL_CLASS,
  BTN_PRIMARY_CLASS,
  BTN_SECONDARY_CLASS,
  CARD_BODY_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  LIST_ITEM_CONTENT_CLASS,
  LIST_ITEM_ROW_CLASS,
  SECTION_TITLE_CLASS,
  TEXT_MUTED_CLASS,
} from '@/constants/ui.constants'
import { useAdminCatalogStore } from '@/stores/admin-catalog.store'
import { useModalStore } from '@/stores/modal.store'
import { useToastStore } from '@/stores/toast.store'
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

const MEDIA_TYPES: CatalogMediaType[] = ['IMAGE', 'GIF', 'VIDEO', 'YOUTUBE']

const catalogStore = useAdminCatalogStore()
const modalStore = useModalStore()
const toastStore = useToastStore()
const { t } = useI18n()

const { entries, loading, saving, deletingId } = storeToRefs(catalogStore)

const editingId = ref<number | null>(null)
const slug = ref('')
const nameEs = ref('')
const nameEn = ref('')
const descriptionEs = ref('')
const descriptionEn = ref('')
const muscleGroup = ref<MuscleGroup>('CHEST')
const mediaType = ref<CatalogMediaType>('IMAGE')
const mediaUrl = ref('')
const sortOrder = ref<number | string>(0)
const active = ref(true)

const isEditing = computed(() => editingId.value !== null)
const formTitle = computed(() =>
  isEditing.value ? t('admin.catalog.form.editTitle') : t('admin.catalog.form.newTitle'),
)

function resetForm() {
  editingId.value = null
  slug.value = ''
  nameEs.value = ''
  nameEn.value = ''
  descriptionEs.value = ''
  descriptionEn.value = ''
  muscleGroup.value = 'CHEST'
  mediaType.value = 'IMAGE'
  mediaUrl.value = ''
  sortOrder.value = 0
  active.value = true
}

function startEdit(entry: AdminExerciseCatalogEntry) {
  editingId.value = entry.id
  slug.value = entry.slug
  nameEs.value = entry.nameEs
  nameEn.value = entry.nameEn
  descriptionEs.value = entry.descriptionEs ?? ''
  descriptionEn.value = entry.descriptionEn ?? ''
  muscleGroup.value = entry.muscleGroup
  mediaType.value = entry.mediaType
  mediaUrl.value = entry.mediaUrl ?? ''
  sortOrder.value = entry.sortOrder
  active.value = entry.active
}

function buildBody() {
  return {
    slug: slug.value.trim(),
    nameEs: nameEs.value.trim(),
    nameEn: nameEn.value.trim(),
    descriptionEs: descriptionEs.value.trim() || null,
    descriptionEn: descriptionEn.value.trim() || null,
    muscleGroup: muscleGroup.value,
    mediaType: mediaType.value,
    mediaUrl: mediaUrl.value.trim() || null,
    sortOrder: Number(sortOrder.value) || 0,
    active: active.value,
  }
}

onMounted(async () => {
  try {
    await catalogStore.fetchAll()
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('admin.catalog.loadError')))
  }
})

async function handleSubmit() {
  try {
    const body = buildBody()

    if (isEditing.value && editingId.value !== null) {
      await catalogStore.update(editingId.value, body)
      toastStore.success(t('admin.catalog.updateSuccess'))
    } else {
      await catalogStore.create(body)
      toastStore.success(t('admin.catalog.createSuccess'))
    }

    resetForm()
  } catch (error) {
    toastStore.error(
      getErrorMessage(
        error,
        isEditing.value ? t('admin.catalog.updateError') : t('admin.catalog.createError'),
      ),
    )
  }
}

async function handleDelete(entry: AdminExerciseCatalogEntry) {
  const confirmed = await modalStore.confirm({
    title: t('admin.catalog.deleteTitle'),
    message:
      entry.importCount > 0
        ? t('admin.catalog.deleteMessageWithImports', { count: entry.importCount })
        : t('admin.catalog.deleteMessage'),
    confirmLabel: t('common.delete'),
    variant: 'danger',
  })

  if (!confirmed) {
    return
  }

  if (editingId.value === entry.id) {
    resetForm()
  }

  try {
    await catalogStore.remove(entry.id)
    toastStore.success(t('admin.catalog.deleteSuccess'))
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('admin.catalog.deleteError')))
  }
}
</script>

<template>
  <PageContainer>
    <div class="mb-4">
      <RouterLink
        to="/admin"
        class="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        ← {{ t('admin.catalog.backToAdmin') }}
      </RouterLink>
    </div>

    <RoutePageHeader />

    <section :class="CARD_BODY_CLASS">
      <h2 :class="SECTION_TITLE_CLASS">{{ formTitle }}</h2>

      <form class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="handleSubmit">
        <div>
          <label for="catalog-slug" :class="LABEL_CLASS">{{ t('admin.catalog.fields.slug') }}</label>
          <input id="catalog-slug" v-model="slug" type="text" required :class="INPUT_CLASS" />
        </div>

        <div>
          <label for="catalog-sort" :class="LABEL_CLASS">{{ t('admin.catalog.fields.sortOrder') }}</label>
          <input id="catalog-sort" v-model="sortOrder" type="number" :class="INPUT_CLASS" />
        </div>

        <div>
          <label for="catalog-name-es" :class="LABEL_CLASS">{{ t('admin.catalog.fields.nameEs') }}</label>
          <input id="catalog-name-es" v-model="nameEs" type="text" required :class="INPUT_CLASS" />
        </div>

        <div>
          <label for="catalog-name-en" :class="LABEL_CLASS">{{ t('admin.catalog.fields.nameEn') }}</label>
          <input id="catalog-name-en" v-model="nameEn" type="text" required :class="INPUT_CLASS" />
        </div>

        <div>
          <label for="catalog-desc-es" :class="LABEL_CLASS">{{ t('admin.catalog.fields.descriptionEs') }}</label>
          <input id="catalog-desc-es" v-model="descriptionEs" type="text" :class="INPUT_CLASS" />
        </div>

        <div>
          <label for="catalog-desc-en" :class="LABEL_CLASS">{{ t('admin.catalog.fields.descriptionEn') }}</label>
          <input id="catalog-desc-en" v-model="descriptionEn" type="text" :class="INPUT_CLASS" />
        </div>

        <div>
          <label for="catalog-muscle" :class="LABEL_CLASS">{{ t('admin.catalog.fields.muscleGroup') }}</label>
          <select id="catalog-muscle" v-model="muscleGroup" :class="INPUT_CLASS">
            <option v-for="group in MUSCLE_GROUPS" :key="group" :value="group">
              {{ t(`exerciseCatalog.muscleGroups.${group}`) }}
            </option>
          </select>
        </div>

        <div>
          <label for="catalog-media-type" :class="LABEL_CLASS">{{ t('admin.catalog.fields.mediaType') }}</label>
          <select id="catalog-media-type" v-model="mediaType" :class="INPUT_CLASS">
            <option v-for="type in MEDIA_TYPES" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>

        <div class="md:col-span-2">
          <label for="catalog-media-url" :class="LABEL_CLASS">{{ t('admin.catalog.fields.mediaUrl') }}</label>
          <input id="catalog-media-url" v-model="mediaUrl" type="url" :class="INPUT_CLASS" />
        </div>

        <label class="flex items-center gap-2 text-sm text-text-primary md:col-span-2">
          <input v-model="active" type="checkbox" class="h-4 w-4 rounded border-border-default" />
          {{ t('admin.catalog.fields.active') }}
        </label>

        <div class="flex flex-col gap-2 md:col-span-2 sm:flex-row">
          <LoadingButton type="submit" :loading="saving" :class="[BTN_PRIMARY_CLASS, BTN_MOBILE_FULL_CLASS]">
            {{ isEditing ? t('common.save') : t('admin.catalog.form.createButton') }}
          </LoadingButton>
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

    <section :class="[CARD_BODY_CLASS, 'mt-4']">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 :class="SECTION_TITLE_CLASS">{{ t('admin.catalog.listTitle') }}</h2>
        <LoadingSpinner v-if="loading" size="sm" class="text-blue-600" />
      </div>

      <SkeletonList v-if="loading && entries.length === 0" />

      <ul v-else class="divide-y divide-border-default">
        <li
          v-for="entry in entries"
          :key="entry.id"
          :class="[LIST_ITEM_ROW_CLASS, { 'opacity-60': !entry.active }]"
        >
          <div :class="LIST_ITEM_CONTENT_CLASS">
            <div class="flex flex-wrap items-center gap-2">
              <p class="font-medium text-text-primary">{{ entry.nameEs }} / {{ entry.nameEn }}</p>
              <span
                v-if="!entry.active"
                class="rounded-full bg-bg-muted px-2 py-0.5 text-xs font-medium text-text-muted"
              >
                {{ t('admin.catalog.inactive') }}
              </span>
            </div>
            <p :class="['text-sm', TEXT_MUTED_CLASS]">
              {{ entry.slug }} · {{ t(`exerciseCatalog.muscleGroups.${entry.muscleGroup}`) }} ·
              {{ t('admin.catalog.importCount', { count: entry.importCount }) }}
            </p>
          </div>

          <div class="flex shrink-0 gap-2">
            <button type="button" :class="BTN_SECONDARY_CLASS" @click="startEdit(entry)">
              {{ t('common.edit') }}
            </button>
            <button
              type="button"
              :class="BTN_SECONDARY_CLASS"
              :disabled="deletingId === entry.id"
              @click="handleDelete(entry)"
            >
              {{ deletingId === entry.id ? t('common.saving') : t('common.delete') }}
            </button>
          </div>
        </li>
      </ul>
    </section>
  </PageContainer>
</template>
