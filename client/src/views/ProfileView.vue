<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import PageContainer from '@/components/layout/PageContainer.vue'
import RoutePageHeader from '@/components/layout/RoutePageHeader.vue'
import AdminIcon from '@/components/profile/AdminIcon.vue'
import ProfileAvatarUpload from '@/components/profile/ProfileAvatarUpload.vue'
import AddWeightModal from '@/components/profile/AddWeightModal.vue'
import ScaleWeightIcon from '@/components/profile/ScaleWeightIcon.vue'
import WeightEvolutionChart from '@/components/profile/WeightEvolutionChart.vue'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ListItemIconActions from '@/components/ui/ListItemIconActions.vue'
import type { WeightEntryPublic } from '@/interfaces/profile.interface'
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
} from '@/constants/ui.constants'
import { useProfileStore } from '@/stores/profile.store'
import { useModalStore } from '@/stores/modal.store'
import { useToastStore } from '@/stores/toast.store'
import { dateInputToIso, formatWorkoutDate, isoToDateInputValue } from '@/utils/date.util'
import { getErrorMessage } from '@/utils/error.util'
import { parseOptionalNumber } from '@/utils/profile.util'

const BMI_CATEGORY_KEYS: Record<string, string> = {
  UNDERWEIGHT: 'profile.bmi.underweight',
  NORMAL: 'profile.bmi.normal',
  OVERWEIGHT: 'profile.bmi.overweight',
  OBESITY: 'profile.bmi.obesity',
}

const profileStore = useProfileStore()
const modalStore = useModalStore()
const toastStore = useToastStore()
const { t } = useI18n()

const { profile, loading, saving, addingWeight, updatingWeightId, deletingWeightId } =
  storeToRefs(profileStore)

const name = ref('')
const heightCm = ref<string | number>('')
const weightKg = ref<string | number>('')
const showAddWeightModal = ref(false)
const weightEditingId = ref<number | null>(null)
const editWeightKg = ref<string | number>('')
const editRecordedAt = ref('')

const hasBmi = computed(() => profile.value?.bmi !== null && profile.value?.bmi !== undefined)

const showWeightChart = computed(() => (profile.value?.weightEntries.length ?? 0) >= 2)

const isAdmin = computed(() => profile.value?.role === 'ADMIN')

const bmiCategoryLabel = computed(() => {
  const category = profile.value?.bmiCategory

  if (!category) {
    return ''
  }

  const key = BMI_CATEGORY_KEYS[category]

  return key ? t(key) : category
})

const bmiCardClass = computed(() => {
  switch (profile.value?.bmiCategory) {
    case 'UNDERWEIGHT':
      return 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200'
    case 'NORMAL':
      return 'border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-200'
    case 'OVERWEIGHT':
      return 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200'
    case 'OBESITY':
      return 'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200'
    default:
      return 'border-border-default bg-bg-muted text-text-secondary'
  }
})

function syncFormFromProfile() {
  if (!profile.value) {
    return
  }

  name.value = profile.value.name ?? ''
  heightCm.value = profile.value.heightCm?.toString() ?? ''
  weightKg.value = profile.value.latestWeightKg?.toString() ?? ''
}

watch(
  () => profile.value?.id,
  () => syncFormFromProfile(),
  { immediate: true },
)

onMounted(async () => {
  try {
    await profileStore.fetchProfile()
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('profile.loadError')))
  }
})

async function handleSaveProfile() {
  if (!profile.value) {
    return
  }

  const trimmedName = name.value.trim()
  const currentName = profile.value.name ?? ''
  const parsedHeight = parseOptionalNumber(heightCm.value)
  const currentHeight = profile.value.heightCm ?? null
  const weightInput = String(weightKg.value).trim()
  const currentWeightStr = profile.value.latestWeightKg?.toString() ?? ''

  const body: { name?: string; heightCm?: number | null; weightKg?: number } = {}

  if (trimmedName !== currentName) {
    body.name = trimmedName
  }

  if (parsedHeight !== currentHeight) {
    if (parsedHeight !== null && (parsedHeight < 50 || parsedHeight > 250)) {
      toastStore.error(t('profile.heightInvalid'))
      return
    }

    body.heightCm = parsedHeight
  }

  if (weightInput !== currentWeightStr) {
    const parsedWeight = parseOptionalNumber(weightInput)

    if (parsedWeight === null || parsedWeight < 20 || parsedWeight > 500) {
      toastStore.error(t('profile.weightInvalid'))
      return
    }

    body.weightKg = parsedWeight
  }

  if (Object.keys(body).length === 0) {
    toastStore.error(t('profile.noChanges'))
    return
  }

  try {
    await profileStore.saveProfile(body)
    syncFormFromProfile()
    toastStore.success(t('profile.saveSuccess'))
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('profile.saveError')))
  }
}

async function handleAddWeight(weight: number) {
  try {
    await profileStore.registerWeight(weight)
    syncFormFromProfile()
    showAddWeightModal.value = false
    toastStore.success(t('profile.weightAddSuccess'))
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('profile.weightAddError')))
  }
}

function resetWeightEdit() {
  weightEditingId.value = null
  editWeightKg.value = ''
  editRecordedAt.value = ''
}

function startEditWeightEntry(entry: WeightEntryPublic) {
  weightEditingId.value = entry.id
  editWeightKg.value = entry.weightKg
  editRecordedAt.value = isoToDateInputValue(entry.recordedAt)
}

async function handleSaveWeightEntry() {
  if (weightEditingId.value === null) {
    return
  }

  const parsedWeight = parseOptionalNumber(editWeightKg.value)

  if (parsedWeight === null || parsedWeight < 20 || parsedWeight > 500) {
    toastStore.error(t('profile.weightInvalid'))
    return
  }

  if (!editRecordedAt.value.trim()) {
    toastStore.error(t('profile.dateRequired'))
    return
  }

  try {
    await profileStore.updateWeightEntry(weightEditingId.value, {
      weightKg: parsedWeight,
      recordedAt: dateInputToIso(editRecordedAt.value),
    })
    resetWeightEdit()
    toastStore.success(t('profile.weightUpdateSuccess'))
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('profile.weightUpdateError')))
  }
}

async function handleDeleteWeightEntry(entry: WeightEntryPublic) {
  const confirmed = await modalStore.confirm({
    title: t('modals.deleteWeightEntry.title'),
    message: t('modals.deleteWeightEntry.message', {
      weight: entry.weightKg,
      date: formatWorkoutDate(entry.recordedAt),
    }),
    confirmLabel: t('common.delete'),
    variant: 'danger',
  })

  if (!confirmed) {
    return
  }

  if (weightEditingId.value === entry.id) {
    resetWeightEdit()
  }

  try {
    await profileStore.removeWeightEntry(entry.id)
    toastStore.success(t('profile.weightDeleteSuccess'))
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('profile.weightDeleteError')))
  }
}
</script>

<template>
  <PageContainer>
    <RoutePageHeader />

    <div v-if="loading && !profile" class="flex justify-center py-12">
      <LoadingSpinner size="lg" class="text-blue-600" />
    </div>

    <template v-else-if="profile">
      <section :class="CARD_BODY_CLASS">
        <div class="flex items-center justify-between">
          <h2 :class="SECTION_TITLE_CLASS">{{ t('profile.sections.avatar') }}</h2>
          <div v-if="isAdmin" class="mb-4 flex justify-end">
            <RouterLink
              to="/admin"
              class="rounded-2xl transition hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              :aria-label="t('admin.goToAdmin')"
            >
              <AdminIcon :size="48" :tooltip="t('admin.goToAdmin')" />
            </RouterLink>
          </div>
        </div>
        <ProfileAvatarUpload />
      </section>

      <section :class="CARD_BODY_CLASS">
        <h2 :class="SECTION_TITLE_CLASS">{{ t('profile.sections.personalData') }}</h2>

        <form class="space-y-4" novalidate @submit.prevent="handleSaveProfile">
          <div>
            <label for="profile-name" :class="LABEL_CLASS">{{ t('common.name') }}</label>
            <input
              id="profile-name"
              v-model="name"
              type="text"
              autocomplete="name"
              :disabled="saving"
              :class="INPUT_CLASS"
              :placeholder="t('common.namePlaceholder')"
            />
          </div>

          <div>
            <label for="profile-email" :class="LABEL_CLASS">{{ t('common.email') }}</label>
            <input
              id="profile-email"
              :value="profile.email"
              type="email"
              disabled
              :class="`${INPUT_CLASS} bg-bg-muted text-text-muted`"
            />
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label for="profile-height" :class="LABEL_CLASS">{{ t('common.heightCm') }}</label>
              <input
                id="profile-height"
                v-model="heightCm"
                type="number"
                min="50"
                max="250"
                step="0.1"
                inputmode="decimal"
                :disabled="saving"
                :class="INPUT_CLASS"
                :placeholder="t('common.heightPlaceholder')"
              />
            </div>

            <div>
              <label for="profile-weight" :class="LABEL_CLASS">{{ t('common.weightKg') }}</label>
              <input
                id="profile-weight"
                v-model="weightKg"
                type="number"
                min="20"
                max="500"
                step="0.1"
                inputmode="decimal"
                :disabled="saving"
                :class="INPUT_CLASS"
                :placeholder="t('common.weightPlaceholder')"
              />
            </div>
          </div>

          <LoadingButton type="submit" :loading="saving">
            {{ t('common.saveChanges') }}
          </LoadingButton>
        </form>
      </section>

      <section :class="[`${CARD_BODY_CLASS} border`, bmiCardClass]">
        <h2 :class="SECTION_TITLE_CLASS">{{ t('profile.sections.bmi') }}</h2>

        <div v-if="hasBmi" class="space-y-1">
          <p class="text-3xl font-bold">{{ profile.bmi }}</p>
          <p class="text-sm font-medium">{{ bmiCategoryLabel }}</p>
          <p class="mt-2 text-sm opacity-80">{{ t('profile.bmi.calculated') }}</p>
        </div>

        <p v-else class="text-sm opacity-80">{{ t('profile.bmi.empty') }}</p>
      </section>

      <section v-if="showWeightChart" :class="CARD_BODY_CLASS">
        <h2 :class="SECTION_TITLE_CLASS">{{ t('profile.sections.weightEvolution') }}</h2>
        <WeightEvolutionChart :entries="profile.weightEntries" />
      </section>

      <section v-if="profile.weightEntries.length > 0" :class="CARD_BODY_CLASS">
        <div class="mb-4 flex items-center justify-between gap-3">
          <h2 class="text-base font-semibold text-text-primary sm:text-lg">
            {{ t('profile.sections.weightHistory') }}
          </h2>

          <button
            type="button"
            :aria-label="t('profile.addWeight.ariaLabel')"
            class="shrink-0 rounded-2xl transition hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            @click="showAddWeightModal = true"
          >
            <ScaleWeightIcon :size="48" :tooltip="t('profile.addWeight.tooltip')" />
          </button>
        </div>

        <ul class="divide-y divide-border-default">
          <li
            v-for="entry in profile.weightEntries"
            :key="entry.id"
            :class="[
              weightEditingId === entry.id ? 'py-3 first:pt-0 last:pb-0' : LIST_ITEM_ROW_CLASS,
              { 'rounded-lg bg-nav-active-bg px-3 -mx-3': weightEditingId === entry.id },
            ]"
          >
            <form
              v-if="weightEditingId === entry.id"
              class="flex w-full flex-col gap-3"
              novalidate
              @submit.prevent="handleSaveWeightEntry"
            >
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label :for="`edit-weight-${entry.id}`" :class="LABEL_CLASS">
                    {{ t('common.weightKg') }}
                  </label>
                  <input
                    :id="`edit-weight-${entry.id}`"
                    v-model="editWeightKg"
                    type="number"
                    min="20"
                    max="500"
                    step="0.1"
                    inputmode="decimal"
                    required
                    :disabled="updatingWeightId === entry.id"
                    :class="INPUT_CLASS"
                  />
                </div>

                <div>
                  <label :for="`edit-date-${entry.id}`" :class="LABEL_CLASS">
                    {{ t('common.date') }}
                  </label>
                  <input
                    :id="`edit-date-${entry.id}`"
                    v-model="editRecordedAt"
                    type="date"
                    required
                    :disabled="updatingWeightId === entry.id"
                    :class="INPUT_CLASS"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-2 sm:flex-row">
                <LoadingButton
                  type="submit"
                  :loading="updatingWeightId === entry.id"
                  :class="[BTN_PRIMARY_CLASS, BTN_MOBILE_FULL_CLASS]"
                >
                  {{ t('common.save') }}
                </LoadingButton>
                <button
                  type="button"
                  :class="[BTN_SECONDARY_CLASS, BTN_MOBILE_FULL_CLASS]"
                  :disabled="updatingWeightId === entry.id"
                  @click="resetWeightEdit"
                >
                  {{ t('common.cancel') }}
                </button>
              </div>
            </form>

            <template v-else>
              <div :class="LIST_ITEM_CONTENT_CLASS">
                <p class="font-medium text-text-primary">{{ entry.weightKg }} kg</p>
                <p class="text-sm text-text-muted">{{ formatWorkoutDate(entry.recordedAt) }}</p>
              </div>

              <ListItemIconActions
                :deleting="deletingWeightId === entry.id"
                :disabled="updatingWeightId !== null || deletingWeightId !== null"
                @edit="startEditWeightEntry(entry)"
                @delete="handleDeleteWeightEntry(entry)"
              />
            </template>
          </li>
        </ul>
      </section>

      <AddWeightModal
        :open="showAddWeightModal"
        :loading="addingWeight"
        @close="showAddWeightModal = false"
        @submit="handleAddWeight"
      />
    </template>
  </PageContainer>
</template>
