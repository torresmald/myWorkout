<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import PageContainer from '@/components/layout/PageContainer.vue'
import RoutePageHeader from '@/components/layout/RoutePageHeader.vue'
import ProfileAvatarUpload from '@/components/profile/ProfileAvatarUpload.vue'
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

const profileStore = useProfileStore()
const modalStore = useModalStore()
const toastStore = useToastStore()

const { profile, loading, saving, addingWeight, updatingWeightId, deletingWeightId } =
  storeToRefs(profileStore)

const name = ref('')
const heightCm = ref<string | number>('')
const weightKg = ref<string | number>('')
const weightEditingId = ref<number | null>(null)
const editWeightKg = ref<string | number>('')
const editRecordedAt = ref('')

const hasBmi = computed(() => profile.value?.bmi !== null && profile.value?.bmi !== undefined)

const showWeightChart = computed(() => (profile.value?.weightEntries.length ?? 0) >= 2)

const bmiCardClass = computed(() => {
  switch (profile.value?.bmiCategory) {
    case 'Bajo peso':
      return 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200'
    case 'Peso normal':
      return 'border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-200'
    case 'Sobrepeso':
      return 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200'
    case 'Obesidad':
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
    toastStore.error(getErrorMessage(error, 'Error al cargar el perfil'))
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

  const body: { name?: string; heightCm?: number | null } = {}

  if (trimmedName !== currentName) {
    body.name = trimmedName
  }

  if (parsedHeight !== currentHeight) {
    if (parsedHeight !== null && (parsedHeight < 50 || parsedHeight > 250)) {
      toastStore.error('La altura debe estar entre 50 y 250 cm')
      return
    }

    body.heightCm = parsedHeight
  }

  if (Object.keys(body).length === 0) {
    toastStore.error('No hay cambios para guardar')
    return
  }

  try {
    await profileStore.saveProfile(body)
    syncFormFromProfile()
    toastStore.success('Datos personales guardados')
  } catch (error) {
    toastStore.error(getErrorMessage(error, 'Error al guardar los datos'))
  }
}

async function handleAddWeight() {
  const parsedWeight = parseOptionalNumber(weightKg.value)

  if (parsedWeight === null || parsedWeight < 20 || parsedWeight > 500) {
    toastStore.error('El peso debe estar entre 20 y 500 kg')
    return
  }

  try {
    await profileStore.registerWeight(parsedWeight)
    weightKg.value = ''
    toastStore.success('Peso registrado correctamente')
  } catch (error) {
    toastStore.error(getErrorMessage(error, 'Error al registrar el peso'))
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
    toastStore.error('El peso debe estar entre 20 y 500 kg')
    return
  }

  if (!editRecordedAt.value.trim()) {
    toastStore.error('La fecha es obligatoria')
    return
  }

  try {
    await profileStore.updateWeightEntry(weightEditingId.value, {
      weightKg: parsedWeight,
      recordedAt: dateInputToIso(editRecordedAt.value),
    })
    resetWeightEdit()
    toastStore.success('Registro de peso actualizado')
  } catch (error) {
    toastStore.error(getErrorMessage(error, 'Error al actualizar el registro de peso'))
  }
}

async function handleDeleteWeightEntry(entry: WeightEntryPublic) {
  const confirmed = await modalStore.confirm({
    title: 'Eliminar registro',
    message: `¿Eliminar el registro de ${entry.weightKg} kg del ${formatWorkoutDate(entry.recordedAt)}?`,
    confirmLabel: 'Eliminar',
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
    toastStore.success('Registro de peso eliminado')
  } catch (error) {
    toastStore.error(getErrorMessage(error, 'Error al eliminar el registro de peso'))
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
        <h2 :class="SECTION_TITLE_CLASS">Foto de perfil</h2>
        <ProfileAvatarUpload />
      </section>

      <section :class="CARD_BODY_CLASS">
        <h2 :class="SECTION_TITLE_CLASS">Datos personales</h2>

        <form class="space-y-4" novalidate @submit.prevent="handleSaveProfile">
          <div>
            <label for="profile-name" :class="LABEL_CLASS">Nombre</label>
            <input
              id="profile-name"
              v-model="name"
              type="text"
              autocomplete="name"
              :disabled="saving"
              :class="INPUT_CLASS"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label for="profile-email" :class="LABEL_CLASS">Email</label>
            <input
              id="profile-email"
              :value="profile.email"
              type="email"
              disabled
              :class="`${INPUT_CLASS} bg-bg-muted text-text-muted`"
            />
          </div>

          <div>
            <label for="profile-height" :class="LABEL_CLASS">Altura (cm)</label>
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
              placeholder="175"
            />
          </div>

          <LoadingButton type="submit" :loading="saving">
            Guardar cambios
          </LoadingButton>
        </form>
      </section>

      <section :class="CARD_BODY_CLASS">
        <h2 :class="SECTION_TITLE_CLASS">Peso</h2>

        <p v-if="profile.latestWeightKg !== null" class="mb-4 text-sm text-text-secondary">
          Peso actual:
          <span class="font-semibold text-text-primary">{{ profile.latestWeightKg }} kg</span>
        </p>
        <p v-else class="mb-4 text-sm text-text-muted">Aún no has registrado tu peso.</p>

        <form
          class="flex flex-col gap-3 sm:flex-row sm:items-end"
          novalidate
          @submit.prevent="handleAddWeight"
        >
          <div class="flex-1">
            <label for="profile-weight" :class="LABEL_CLASS">Nuevo peso (kg)</label>
            <input
              id="profile-weight"
              v-model="weightKg"
              type="number"
              min="20"
              max="500"
              step="0.1"
              inputmode="decimal"
              :disabled="addingWeight"
              :class="INPUT_CLASS"
              placeholder="72.5"
            />
          </div>

          <LoadingButton type="submit" :loading="addingWeight" class="sm:w-auto">
            Registrar peso
          </LoadingButton>
        </form>
      </section>

      <section :class="[`${CARD_BODY_CLASS} border`, bmiCardClass]">
        <h2 :class="SECTION_TITLE_CLASS">Índice de masa corporal (IMC)</h2>

        <div v-if="hasBmi" class="space-y-1">
          <p class="text-3xl font-bold">{{ profile.bmi }}</p>
          <p class="text-sm font-medium">{{ profile.bmiCategory }}</p>
          <p class="mt-2 text-sm opacity-80">
            Calculado con tu altura y tu último peso registrado.
          </p>
        </div>

        <p v-else class="text-sm opacity-80">
          Registra tu altura y al menos un peso para ver tu IMC.
        </p>
      </section>

      <section v-if="showWeightChart" :class="CARD_BODY_CLASS">
        <h2 :class="SECTION_TITLE_CLASS">Evolución del peso</h2>
        <WeightEvolutionChart :entries="profile.weightEntries" />
      </section>

      <section v-if="profile.weightEntries.length > 0" :class="CARD_BODY_CLASS">
        <h2 :class="SECTION_TITLE_CLASS">Historial de peso</h2>

        <ul class="divide-y divide-border-default">
          <li
            v-for="entry in profile.weightEntries"
            :key="entry.id"
            :class="[
              weightEditingId === entry.id ? 'py-3 first:pt-0 last:pb-0' : LIST_ITEM_ROW_CLASS,
              { 'rounded-lg bg-blue-50 px-3 -mx-3': weightEditingId === entry.id },
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
                  <label :for="`edit-weight-${entry.id}`" :class="LABEL_CLASS">Peso (kg)</label>
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
                  <label :for="`edit-date-${entry.id}`" :class="LABEL_CLASS">Fecha</label>
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
                  Guardar
                </LoadingButton>
                <button
                  type="button"
                  :class="[BTN_SECONDARY_CLASS, BTN_MOBILE_FULL_CLASS]"
                  :disabled="updatingWeightId === entry.id"
                  @click="resetWeightEdit"
                >
                  Cancelar
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
    </template>
  </PageContainer>
</template>
