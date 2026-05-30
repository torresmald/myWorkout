<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'

import type { ExerciseTypePublic } from '@/interfaces/exercise-type.interface'
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
  <main class="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-8">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Tipos de ejercicio</h1>
        <p class="mt-1 text-sm text-gray-600">Gestiona tu biblioteca de ejercicios</p>
      </div>
      <RouterLink to="/" class="text-sm font-medium text-blue-600 hover:text-blue-700">
        ← Inicio
      </RouterLink>
    </header>

    <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-gray-800">
        {{ isEditing ? 'Editar ejercicio' : 'Nuevo ejercicio' }}
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
            placeholder="Press banca"
          />
        </div>

        <div>
          <label for="description" class="mb-1 block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <input
            id="description"
            v-model="description"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Opcional"
          />
        </div>

        <div>
          <label for="muscleGroup" class="mb-1 block text-sm font-medium text-gray-700">
            Grupo muscular
          </label>
          <input
            id="muscleGroup"
            v-model="muscleGroup"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Pecho, pierna..."
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
                  : 'Crear ejercicio'
            }}
          </button>

          <button
            v-if="isEditing"
            type="button"
            class="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
            @click="resetForm"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>

    <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-gray-800">Mis ejercicios</h2>

      <p v-if="loading" class="text-sm text-gray-500">Cargando ejercicios...</p>

      <p v-else-if="exerciseTypes.length === 0" class="text-sm text-gray-500">
        Aún no tienes ejercicios. Crea el primero arriba.
      </p>

      <ul v-else class="divide-y divide-gray-100">
        <li
          v-for="exercise in exerciseTypes"
          :key="exercise.id"
          class="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          :class="{ 'rounded-lg bg-blue-50 px-3 -mx-3': editingId === exercise.id }"
        >
          <div>
            <p class="font-medium text-gray-900">{{ exercise.name }}</p>
            <p v-if="exercise.description" class="text-sm text-gray-500">
              {{ exercise.description }}
            </p>
            <span
              v-if="exercise.muscleGroup"
              class="mt-1 inline-flex w-fit rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700"
            >
              {{ exercise.muscleGroup }}
            </span>
          </div>

          <div class="flex shrink-0 gap-2">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="deletingId === exercise.id"
              @click="startEdit(exercise)"
            >
              Editar
            </button>
            <button
              type="button"
              class="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="deletingId === exercise.id"
              @click="handleDelete(exercise)"
            >
              {{ deletingId === exercise.id ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </li>
      </ul>
    </section>
  </main>
</template>
