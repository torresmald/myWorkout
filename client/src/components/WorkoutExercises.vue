<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'

import ListItemIconActions from '@/components/ui/ListItemIconActions.vue'
import RestTimerModal from '@/components/workout/RestTimerModal.vue'
import { useRestTimer } from '@/composables/useRestTimer'
import type { WorkoutExercisePublic } from '@/interfaces/workout.interface'
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
import { useWorkoutStore } from '@/stores/workout.store'
import { getErrorMessage } from '@/utils/error.util'

const props = defineProps<{
  workoutId: number
}>()

const workoutStore = useWorkoutStore()
const exerciseTypeStore = useExerciseTypeStore()
const modalStore = useModalStore()
const toastStore = useToastStore()

const {
  isOpen: isRestTimerOpen,
  isPaused: isRestTimerPaused,
  isFinished: isRestTimerFinished,
  exerciseName: restTimerExerciseName,
  remainingSeconds: restTimerRemainingSeconds,
  start: startRestTimer,
  togglePause: toggleRestTimerPause,
  cancel: cancelRestTimer,
  closeAfterFinish: closeRestTimerAfterFinish,
} = useRestTimer()

const { exercises, loadingExercises, creatingExercise, updatingExerciseId, deletingExerciseId } =
  storeToRefs(workoutStore)

const { exerciseTypes } = storeToRefs(exerciseTypeStore)

const exerciseEditingId = ref<number | null>(null)
const exerciseTypeId = ref<number | ''>('')
const sets = ref(3)
const reps = ref(10)
const restSeconds = ref(60)
const weight = ref<number | ''>('')
const sortOrder = ref(0)

const savingExercise = computed(() =>
  exerciseEditingId.value !== null ? updatingExerciseId.value !== null : creatingExercise.value,
)

function resetForm() {
  exerciseEditingId.value = null
  exerciseTypeId.value = ''
  sets.value = 3
  reps.value = 10
  restSeconds.value = 60
  weight.value = ''
  sortOrder.value = exercises.value.length
}

function startEditExercise(exercise: WorkoutExercisePublic) {
  exerciseEditingId.value = exercise.id
  exerciseTypeId.value = exercise.exerciseTypeId
  sets.value = exercise.sets
  reps.value = exercise.reps
  restSeconds.value = exercise.restSeconds
  weight.value = exercise.weight ?? ''
  sortOrder.value = exercise.sortOrder
}

function formatExerciseDetails(exercise: WorkoutExercisePublic): string {
  const parts = [`${exercise.sets} × ${exercise.reps}`]

  if (exercise.restSeconds > 0) {
    parts.push(`${exercise.restSeconds}s descanso`)
  }

  if (exercise.weight !== null) {
    parts.push(`${exercise.weight} kg`)
  }

  return parts.join(' · ')
}

function buildExerciseBody() {
  return {
    exerciseTypeId: Number(exerciseTypeId.value),
    sets: sets.value,
    reps: reps.value,
    restSeconds: restSeconds.value,
    weight: weight.value === '' ? null : Number(weight.value),
    sortOrder: sortOrder.value,
  }
}

async function handleSubmit() {
  const body = buildExerciseBody()

  try {
    if (exerciseEditingId.value !== null) {
      await workoutStore.updateExercise(props.workoutId, exerciseEditingId.value, body)
      toastStore.success('Ejercicio actualizado correctamente')
    } else {
      await workoutStore.createExercise(props.workoutId, body)
      toastStore.success('Ejercicio añadido correctamente')
    }

    resetForm()
    sortOrder.value = exercises.value.length
  } catch (e) {
    toastStore.error(
      getErrorMessage(
        e,
        exerciseEditingId.value !== null
          ? 'Error al actualizar el ejercicio'
          : 'Error al añadir el ejercicio',
      ),
    )
  }
}

function startExerciseRestTimer(exercise: WorkoutExercisePublic) {
  if (exercise.restSeconds <= 0) {
    return
  }

  startRestTimer(exercise.exerciseType.name, exercise.restSeconds)
}

async function handleDelete(exercise: WorkoutExercisePublic) {
  const confirmed = await modalStore.confirm({
    title: 'Eliminar ejercicio',
    message: `¿Eliminar "${exercise.exerciseType.name}" del entrenamiento?`,
    confirmLabel: 'Eliminar',
    variant: 'danger',
  })

  if (!confirmed) {
    return
  }

  if (exerciseEditingId.value === exercise.id) {
    resetForm()
  }

  try {
    await workoutStore.removeExercise(props.workoutId, exercise.id)
    toastStore.success('Ejercicio eliminado correctamente')
    sortOrder.value = exercises.value.length
  } catch (e) {
    toastStore.error(getErrorMessage(e, 'Error al eliminar el ejercicio'))
  }
}

watch(
  () => props.workoutId,
  async (workoutId) => {
    resetForm()

    try {
      await workoutStore.fetchExercises(workoutId)
      sortOrder.value = exercises.value.length
    } catch (e) {
      toastStore.error(getErrorMessage(e, 'Error al cargar los ejercicios del entrenamiento'))
    }
  },
  { immediate: true },
)

onMounted(async () => {
  try {
    await exerciseTypeStore.fetchAll()
  } catch (e) {
    toastStore.error(getErrorMessage(e, 'Error al cargar los tipos de ejercicio'))
  }
})

defineExpose({ resetForm })
</script>

<template>
  <section :class="CARD_BODY_CLASS">
    <h2 :class="SECTION_TITLE_CLASS">Ejercicios del entrenamiento</h2>

    <p v-if="loadingExercises" class="text-sm text-gray-500">Cargando ejercicios...</p>

    <ul v-else-if="exercises.length > 0" class="mb-6 divide-y divide-gray-100">
      <li
        v-for="exercise in exercises"
        :key="exercise.id"
        :class="[
          LIST_ITEM_ROW_CLASS,
          { 'rounded-lg bg-blue-50 px-3 -mx-3': exerciseEditingId === exercise.id },
        ]"
      >
        <div :class="LIST_ITEM_CONTENT_CLASS">
          <p class="font-medium text-gray-900">{{ exercise.exerciseType.name }}</p>
          <p class="text-sm text-gray-500">{{ formatExerciseDetails(exercise) }}</p>
          <span
            v-if="exercise.exerciseType.muscleGroup"
            class="mt-1 inline-flex w-fit rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700"
          >
            {{ exercise.exerciseType.muscleGroup }}
          </span>
        </div>

        <ListItemIconActions
          :show-timer="exercise.restSeconds > 0"
          :deleting="deletingExerciseId === exercise.id"
          @timer="startExerciseRestTimer(exercise)"
          @edit="startEditExercise(exercise)"
          @delete="handleDelete(exercise)"
        />
      </li>
    </ul>

    <p v-else class="mb-6 text-sm text-gray-500">Este entrenamiento aún no tiene ejercicios.</p>

    <div
      v-if="exerciseTypes.length === 0"
      class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
    >
      Crea tipos de ejercicio antes de añadirlos al entrenamiento.
      <RouterLink to="/exercise-types" class="ml-1 font-medium underline">
        Ir a tipos de ejercicio
      </RouterLink>
    </div>

    <form
      v-else
      class="space-y-4 border-t border-gray-100 pt-4"
      @submit.prevent="handleSubmit"
    >
      <h3 class="text-sm font-semibold text-gray-800">
        {{ exerciseEditingId !== null ? 'Editar ejercicio' : 'Añadir ejercicio' }}
      </h3>

      <div>
        <label for="exerciseTypeId" :class="LABEL_CLASS">Tipo de ejercicio</label>
        <select id="exerciseTypeId" v-model="exerciseTypeId" required :class="INPUT_CLASS">
          <option disabled value="">Selecciona un ejercicio</option>
          <option v-for="type in exerciseTypes" :key="type.id" :value="type.id">
            {{ type.name }}
          </option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label for="sets" :class="LABEL_CLASS">Series</label>
          <input
            id="sets"
            v-model.number="sets"
            type="number"
            min="1"
            required
            :class="INPUT_CLASS"
          />
        </div>

        <div>
          <label for="reps" :class="LABEL_CLASS">Reps</label>
          <input
            id="reps"
            v-model.number="reps"
            type="number"
            min="1"
            required
            :class="INPUT_CLASS"
          />
        </div>

        <div>
          <label for="restSeconds" :class="LABEL_CLASS">Descanso (s)</label>
          <input
            id="restSeconds"
            v-model.number="restSeconds"
            type="number"
            min="0"
            required
            :class="INPUT_CLASS"
          />
        </div>

        <div>
          <label for="weight" :class="LABEL_CLASS">Peso (kg)</label>
          <input
            id="weight"
            v-model.number="weight"
            type="number"
            min="0"
            step="0.5"
            :class="INPUT_CLASS"
            placeholder="Opcional"
          />
        </div>
      </div>

      <div :class="BTN_ACTIONS_CLASS">
        <button
          type="submit"
          :disabled="savingExercise"
          :class="[BTN_PRIMARY_CLASS, BTN_MOBILE_FULL_CLASS]"
        >
          {{
            savingExercise
              ? exerciseEditingId !== null
                ? 'Guardando...'
                : 'Añadiendo...'
              : exerciseEditingId !== null
                ? 'Guardar ejercicio'
                : 'Añadir ejercicio'
          }}
        </button>

        <button
          v-if="exerciseEditingId !== null"
          type="button"
          :class="[BTN_SECONDARY_CLASS, BTN_MOBILE_FULL_CLASS]"
          @click="resetForm"
        >
          Cancelar
        </button>
      </div>
    </form>
  </section>

  <RestTimerModal
    :open="isRestTimerOpen"
    :exercise-name="restTimerExerciseName"
    :remaining-seconds="restTimerRemainingSeconds"
    :is-paused="isRestTimerPaused"
    :is-finished="isRestTimerFinished"
    @toggle-pause="toggleRestTimerPause"
    @cancel="cancelRestTimer"
    @close="closeRestTimerAfterFinish"
  />
</template>
