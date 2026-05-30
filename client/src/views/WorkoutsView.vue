<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'

import type { WorkoutExercisePublic, WorkoutPublic } from '@/interfaces/workout.interface'
import { useExerciseTypeStore } from '@/stores/exercise-type.store'
import { useModalStore } from '@/stores/modal.store'
import { useToastStore } from '@/stores/toast.store'
import { useWorkoutStore } from '@/stores/workout.store'
import {
  dateInputToIso,
  formatWorkoutDate,
  isoToDateInputValue,
  todayDateInputValue,
} from '@/utils/date.util'
import { getErrorMessage } from '@/utils/error.util'

const workoutStore = useWorkoutStore()
const exerciseTypeStore = useExerciseTypeStore()
const modalStore = useModalStore()
const toastStore = useToastStore()

const {
  workouts,
  exercises,
  loading,
  creating,
  updating,
  deletingId,
  loadingExercises,
  creatingExercise,
  updatingExerciseId,
  deletingExerciseId,
} = storeToRefs(workoutStore)

const { exerciseTypes } = storeToRefs(exerciseTypeStore)

const editingId = ref<number | null>(null)
const name = ref('')
const date = ref(todayDateInputValue())
const notes = ref('')

const exerciseEditingId = ref<number | null>(null)
const exerciseTypeId = ref<number | ''>('')
const sets = ref(3)
const reps = ref(10)
const restSeconds = ref(60)
const weight = ref<number | ''>('')
const sortOrder = ref(0)

const isEditing = computed(() => editingId.value !== null)
const saving = computed(() => (isEditing.value ? updating.value : creating.value))
const savingExercise = computed(() =>
  exerciseEditingId.value !== null ? updatingExerciseId.value !== null : creatingExercise.value,
)

function resetWorkoutForm() {
  editingId.value = null
  name.value = ''
  date.value = todayDateInputValue()
  notes.value = ''
  workoutStore.clearExercises()
  resetExerciseForm()
}

function resetExerciseForm() {
  exerciseEditingId.value = null
  exerciseTypeId.value = ''
  sets.value = 3
  reps.value = 10
  restSeconds.value = 60
  weight.value = ''
  sortOrder.value = exercises.value.length
}

async function startEdit(workout: WorkoutPublic) {
  editingId.value = workout.id
  name.value = workout.name
  date.value = isoToDateInputValue(workout.date)
  notes.value = workout.notes ?? ''
  resetExerciseForm()

  try {
    await workoutStore.fetchExercises(workout.id)
    sortOrder.value = exercises.value.length
  } catch (e) {
    toastStore.error(getErrorMessage(e, 'Error al cargar los ejercicios del entrenamiento'))
  }
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

onMounted(async () => {
  try {
    await Promise.all([workoutStore.fetchAll(), exerciseTypeStore.fetchAll()])
  } catch (e) {
    toastStore.error(getErrorMessage(e, 'Error al cargar los entrenamientos'))
  }
})

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
      resetWorkoutForm()
    }
  } catch (e) {
    toastStore.error(
      getErrorMessage(
        e,
        isEditing.value ? 'Error al actualizar el entrenamiento' : 'Error al crear el entrenamiento',
      ),
    )
  }
}

async function handleDelete(workout: WorkoutPublic) {
  const confirmed = await modalStore.confirm({
    title: 'Eliminar entrenamiento',
    message: `¿Eliminar "${workout.name}"? Se borrarán también sus ejercicios.`,
    confirmLabel: 'Eliminar',
    variant: 'danger',
  })

  if (!confirmed) {
    return
  }

  if (editingId.value === workout.id) {
    resetWorkoutForm()
  }

  try {
    await workoutStore.remove(workout.id)
    toastStore.success('Entrenamiento eliminado correctamente')
  } catch (e) {
    toastStore.error(getErrorMessage(e, 'Error al eliminar el entrenamiento'))
  }
}

async function handleExerciseSubmit() {
  if (editingId.value === null) {
    return
  }

  const body = buildExerciseBody()

  try {
    if (exerciseEditingId.value !== null) {
      await workoutStore.updateExercise(editingId.value, exerciseEditingId.value, body)
      toastStore.success('Ejercicio actualizado correctamente')
    } else {
      await workoutStore.createExercise(editingId.value, body)
      toastStore.success('Ejercicio añadido correctamente')
    }

    resetExerciseForm()
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

async function handleDeleteExercise(exercise: WorkoutExercisePublic) {
  if (editingId.value === null) {
    return
  }

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
    resetExerciseForm()
  }

  try {
    await workoutStore.removeExercise(editingId.value, exercise.id)
    toastStore.success('Ejercicio eliminado correctamente')
    sortOrder.value = exercises.value.length
  } catch (e) {
    toastStore.error(getErrorMessage(e, 'Error al eliminar el ejercicio'))
  }
}
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-8">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Entrenamientos</h1>
        <p class="mt-1 text-sm text-gray-600">Registra y consulta tus sesiones</p>
      </div>
      <RouterLink to="/" class="text-sm font-medium text-blue-600 hover:text-blue-700">
        ← Inicio
      </RouterLink>
    </header>

    <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-gray-800">
        {{ isEditing ? 'Editar entrenamiento' : 'Nuevo entrenamiento' }}
      </h2>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="name" class="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
          <input
            id="name"
            v-model="name"
            type="text"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Pecho y tríceps"
          />
        </div>

        <div>
          <label for="date" class="mb-1 block text-sm font-medium text-gray-700">Fecha</label>
          <input
            id="date"
            v-model="date"
            type="date"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="notes" class="mb-1 block text-sm font-medium text-gray-700">Notas</label>
          <textarea
            id="notes"
            v-model="notes"
            rows="3"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Opcional"
          />
        </div>

        <div class="flex gap-3">
          <button
            type="submit"
            :disabled="saving"
            class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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
            class="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
            @click="resetWorkoutForm"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>

    <section
      v-if="isEditing"
      class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h2 class="mb-4 text-lg font-semibold text-gray-800">Ejercicios del entrenamiento</h2>

      <p v-if="loadingExercises" class="text-sm text-gray-500">Cargando ejercicios...</p>

      <ul v-else-if="exercises.length > 0" class="mb-6 divide-y divide-gray-100">
        <li
          v-for="exercise in exercises"
          :key="exercise.id"
          class="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          :class="{ 'rounded-lg bg-blue-50 px-3 -mx-3': exerciseEditingId === exercise.id }"
        >
          <div>
            <p class="font-medium text-gray-900">{{ exercise.exerciseType.name }}</p>
            <p class="text-sm text-gray-500">{{ formatExerciseDetails(exercise) }}</p>
            <span
              v-if="exercise.exerciseType.muscleGroup"
              class="mt-1 inline-flex w-fit rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700"
            >
              {{ exercise.exerciseType.muscleGroup }}
            </span>
          </div>

          <div class="flex shrink-0 gap-2">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="deletingExerciseId === exercise.id"
              @click="startEditExercise(exercise)"
            >
              Editar
            </button>
            <button
              type="button"
              class="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="deletingExerciseId === exercise.id"
              @click="handleDeleteExercise(exercise)"
            >
              {{ deletingExerciseId === exercise.id ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </li>
      </ul>

      <p v-else class="mb-6 text-sm text-gray-500">Este entrenamiento aún no tiene ejercicios.</p>

      <div v-if="exerciseTypes.length === 0" class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Crea tipos de ejercicio antes de añadirlos al entrenamiento.
        <RouterLink to="/exercise-types" class="ml-1 font-medium underline">
          Ir a tipos de ejercicio
        </RouterLink>
      </div>

      <form v-else class="space-y-4 border-t border-gray-100 pt-4" @submit.prevent="handleExerciseSubmit">
        <h3 class="text-sm font-semibold text-gray-800">
          {{ exerciseEditingId !== null ? 'Editar ejercicio' : 'Añadir ejercicio' }}
        </h3>

        <div>
          <label for="exerciseTypeId" class="mb-1 block text-sm font-medium text-gray-700">
            Tipo de ejercicio
          </label>
          <select
            id="exerciseTypeId"
            v-model="exerciseTypeId"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option disabled value="">Selecciona un ejercicio</option>
            <option v-for="type in exerciseTypes" :key="type.id" :value="type.id">
              {{ type.name }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label for="sets" class="mb-1 block text-sm font-medium text-gray-700">Series</label>
            <input
              id="sets"
              v-model.number="sets"
              type="number"
              min="1"
              required
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label for="reps" class="mb-1 block text-sm font-medium text-gray-700">Reps</label>
            <input
              id="reps"
              v-model.number="reps"
              type="number"
              min="1"
              required
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label for="restSeconds" class="mb-1 block text-sm font-medium text-gray-700">
              Descanso (s)
            </label>
            <input
              id="restSeconds"
              v-model.number="restSeconds"
              type="number"
              min="0"
              required
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label for="weight" class="mb-1 block text-sm font-medium text-gray-700">Peso (kg)</label>
            <input
              id="weight"
              v-model.number="weight"
              type="number"
              min="0"
              step="0.5"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Opcional"
            />
          </div>
        </div>

        <div class="flex gap-3">
          <button
            type="submit"
            :disabled="savingExercise"
            class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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
            class="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
            @click="resetExerciseForm"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>

    <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-gray-800">Mis entrenamientos</h2>

      <p v-if="loading" class="text-sm text-gray-500">Cargando entrenamientos...</p>

      <p v-else-if="workouts.length === 0" class="text-sm text-gray-500">
        Aún no tienes entrenamientos. Crea el primero arriba.
      </p>

      <ul v-else class="divide-y divide-gray-100">
        <li
          v-for="workout in workouts"
          :key="workout.id"
          class="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
          :class="{ 'rounded-lg bg-blue-50 px-3 -mx-3': editingId === workout.id }"
        >
          <div>
            <p class="font-medium text-gray-900">{{ workout.name }}</p>
            <p v-if="workout.notes" class="mt-1 text-sm text-gray-500">{{ workout.notes }}</p>
            <time class="mt-1 block text-sm text-gray-500" :datetime="workout.date">
              {{ formatWorkoutDate(workout.date) }}
            </time>
          </div>

          <div class="flex shrink-0 gap-2">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="deletingId === workout.id"
              @click="startEdit(workout)"
            >
              Editar
            </button>
            <button
              type="button"
              class="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="deletingId === workout.id"
              @click="handleDelete(workout)"
            >
              {{ deletingId === workout.id ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </li>
      </ul>
    </section>
  </main>
</template>
