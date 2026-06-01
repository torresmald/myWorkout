<script setup lang="ts">
import ListItemIconActions from '@/components/ui/ListItemIconActions.vue'
import {
  CARD_BODY_CLASS,
  LIST_ITEM_CONTENT_CLASS,
  LIST_ITEM_ROW_CLASS,
  SECTION_TITLE_CLASS,
} from '@/constants/ui.constants'
import type { WorkoutPublic } from '@/interfaces/workout.interface'
import { formatWorkoutDate } from '@/utils/date.util'

const props = defineProps<{
  workouts: WorkoutPublic[]
  loading: boolean
  editingWorkoutId: number | null
  deletingWorkoutId: number | null
}>()

const emit = defineEmits<{
  edit: [workout: WorkoutPublic]
  delete: [workout: WorkoutPublic]
}>()
</script>

<template>
  <section :class="CARD_BODY_CLASS">
    <h2 :class="SECTION_TITLE_CLASS">Mis entrenamientos</h2>

    <p v-if="props.loading" class="text-sm text-gray-500">Cargando entrenamientos...</p>

    <p v-else-if="props.workouts.length === 0" class="text-sm text-gray-500">
      Aún no tienes entrenamientos. Crea el primero arriba.
    </p>

    <ul v-else class="divide-y divide-gray-100">
      <li
        v-for="workout in props.workouts"
        :key="workout.id"
        :class="[
          LIST_ITEM_ROW_CLASS,
          { 'rounded-lg bg-blue-50 px-3 -mx-3': props.editingWorkoutId === workout.id },
        ]"
      >
        <div :class="LIST_ITEM_CONTENT_CLASS">
          <p class="font-medium text-gray-900">{{ workout.name }}</p>
          <p v-if="workout.notes" class="mt-1 text-sm text-gray-500">{{ workout.notes }}</p>
          <time class="mt-1 block text-sm text-gray-500" :datetime="workout.date">
            {{ formatWorkoutDate(workout.date) }}
          </time>
        </div>

        <ListItemIconActions
          :deleting="props.deletingWorkoutId === workout.id"
          @edit="emit('edit', workout)"
          @delete="emit('delete', workout)"
        />
      </li>
    </ul>
  </section>
</template>
