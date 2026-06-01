<script setup lang="ts">
import ListItemIconActions from '@/components/ui/ListItemIconActions.vue'
import {
  CARD_BODY_CLASS,
  LIST_ITEM_CONTENT_CLASS,
  LIST_ITEM_ROW_CLASS,
  SECTION_TITLE_CLASS,
  TEXT_MUTED_CLASS,
  TEXT_HEADING_CLASS,
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

    <p v-if="props.loading" :class="TEXT_MUTED_CLASS">Cargando entrenamientos...</p>

    <p v-else-if="props.workouts.length === 0" :class="TEXT_MUTED_CLASS">
      Aún no tienes entrenamientos. Crea el primero arriba.
    </p>

    <ul v-else class="divide-y divide-border-default">
      <li
        v-for="workout in props.workouts"
        :key="workout.id"
        :class="[
          LIST_ITEM_ROW_CLASS,
          { 'rounded-lg bg-nav-active-bg px-3 -mx-3': props.editingWorkoutId === workout.id },
        ]"
      >
        <div :class="LIST_ITEM_CONTENT_CLASS">
          <p :class="TEXT_HEADING_CLASS">{{ workout.name }}</p>
          <p v-if="workout.notes" class="mt-1 text-sm text-text-muted">{{ workout.notes }}</p>
          <time class="mt-1 block text-sm text-text-muted" :datetime="workout.date">
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
