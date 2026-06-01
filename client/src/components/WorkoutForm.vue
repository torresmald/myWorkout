<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'

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
      toastStore.success('Entrenamiento actualizado correctamente')
    } else {
      await workoutStore.create(body)
      toastStore.success('Entrenamiento creado correctamente')
      resetForm()
    }
  } catch (e) {
    toastStore.error(
      getErrorMessage(
        e,
        isEditing.value
          ? 'Error al actualizar el entrenamiento'
          : 'Error al crear el entrenamiento',
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
      {{ isEditing ? 'Editar entrenamiento' : 'Nuevo entrenamiento' }}
    </h2>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label for="workout-name" :class="LABEL_CLASS">Nombre</label>
        <input
          id="workout-name"
          v-model="name"
          type="text"
          required
          :class="INPUT_CLASS"
          placeholder="Pecho y tríceps"
        />
      </div>

      <div>
        <label for="workout-date" :class="LABEL_CLASS">Fecha</label>
        <input id="workout-date" v-model="date" type="date" required :class="INPUT_CLASS" />
      </div>

      <div>
        <label for="workout-notes" :class="LABEL_CLASS">Notas</label>
        <textarea
          id="workout-notes"
          v-model="notes"
          rows="3"
          :class="INPUT_CLASS"
          placeholder="Opcional"
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
                : 'Crear entrenamiento'
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

  <WorkoutExercises v-if="editingId !== null" :workout-id="editingId" />
</template>
