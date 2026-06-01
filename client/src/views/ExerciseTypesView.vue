<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

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
    toastStore.error(getErrorMessage(e, 'Error al cargar los ejercicios'))
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
      toastStore.success('Ejercicio actualizado correctamente')
    } else {
      await exerciseTypeStore.create(body)
      toastStore.success('Ejercicio creado correctamente')
    }

    resetForm()
  } catch (e) {
    toastStore.error(
      getErrorMessage(
        e,
        isEditing.value ? 'Error al actualizar el ejercicio' : 'Error al crear el ejercicio',
      ),
    )
  }
}

async function handleDelete(exercise: ExerciseTypePublic) {
  const confirmed = await modalStore.confirm({
    title: 'Eliminar ejercicio',
    message: `¿Eliminar "${exercise.name}"? Esta acción no se puede deshacer.`,
    confirmLabel: 'Eliminar',
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
    toastStore.success('Ejercicio eliminado correctamente')
  } catch (e) {
    toastStore.error(getErrorMessage(e, 'Error al eliminar el ejercicio'))
  }
}
</script>

<template>
  <PageContainer>
    <RoutePageHeader />

    <section :class="CARD_BODY_CLASS">
      <h2 :class="SECTION_TITLE_CLASS">
        {{ isEditing ? 'Editar ejercicio' : 'Nuevo ejercicio' }}
      </h2>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="name" :class="LABEL_CLASS">Nombre</label>
          <input
            id="name"
            v-model="name"
            type="text"
            required
            :class="INPUT_CLASS"
            placeholder="Press banca"
          />
        </div>

        <div>
          <label for="description" :class="LABEL_CLASS">Descripción</label>
          <input
            id="description"
            v-model="description"
            type="text"
            :class="INPUT_CLASS"
            placeholder="Opcional"
          />
        </div>

        <div>
          <label for="muscleGroup" :class="LABEL_CLASS">Grupo muscular</label>
          <input
            id="muscleGroup"
            v-model="muscleGroup"
            type="text"
            :class="INPUT_CLASS"
            placeholder="Pecho, pierna..."
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
                  ? 'Guardando...'
                  : 'Creando...'
                : isEditing
                  ? 'Guardar cambios'
                  : 'Crear ejercicio'
            }}
          </button>

          <button
            v-if="isEditing"
            type="button"
            :class="[BTN_SECONDARY_CLASS, BTN_MOBILE_FULL_CLASS]"
            @click="resetForm"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>

    <section :class="CARD_BODY_CLASS">
      <h2 :class="SECTION_TITLE_CLASS">Mis ejercicios</h2>

      <p v-if="loading" class="text-sm text-text-muted">Cargando ejercicios...</p>

      <p v-else-if="exerciseTypes.length === 0" class="text-sm text-text-muted">
        Aún no tienes ejercicios. Crea el primero arriba.
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
