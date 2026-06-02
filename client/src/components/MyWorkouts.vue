<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import EmptyState from '@/components/ui/EmptyState.vue'
import ListItemIconActions from '@/components/ui/ListItemIconActions.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import SkeletonList from '@/components/ui/SkeletonList.vue'
import {
  BTN_ICON_GHOST_CLASS,
  CARD_BODY_CLASS,
  LIST_ITEM_CONTENT_CLASS,
  LIST_ITEM_ROW_CLASS,
  SECTION_TITLE_CLASS,
  TEXT_HEADING_CLASS,
} from '@/constants/ui.constants'
import type { WorkoutPublic } from '@/interfaces/workout.interface'
import { formatWorkoutDate } from '@/utils/date.util'

const props = defineProps<{
  workouts: WorkoutPublic[]
  loading: boolean
  editingWorkoutId: number | null
  deletingWorkoutId: number | null
  openingSessionWorkoutId: number | null
}>()

const emit = defineEmits<{
  edit: [workout: WorkoutPublic]
  delete: [workout: WorkoutPublic]
  session: [workout: WorkoutPublic]
}>()

const { t } = useI18n()

function statusLabel(status: WorkoutPublic['status']) {
  if (status === 'IN_PROGRESS') {
    return t('session.status.inProgress')
  }

  if (status === 'COMPLETED') {
    return t('session.status.completed')
  }

  return t('session.status.planned')
}

function sessionAriaLabel(workout: WorkoutPublic) {
  return workout.status === 'IN_PROGRESS'
    ? t('workouts.list.resumeSession')
    : t('workouts.list.startSession')
}

function canOpenSession(workout: WorkoutPublic) {
  return workout.status !== 'COMPLETED'
}
</script>

<template>
  <section :class="CARD_BODY_CLASS">
    <h2 :class="SECTION_TITLE_CLASS">{{ t('workouts.list.title') }}</h2>

    <SkeletonList v-if="props.loading" />

    <EmptyState
      v-else-if="props.workouts.length === 0"
      variant="workouts"
      :title="t('empty.workouts.title')"
      :description="t('empty.workouts.description')"
    />

    <ul v-else class="divide-y divide-border-default">
      <li
        v-for="(workout, index) in props.workouts"
        :key="workout.id"
        :class="[
          LIST_ITEM_ROW_CLASS,
          'stagger-item',
          { 'rounded-lg bg-nav-active-bg px-3 -mx-3': props.editingWorkoutId === workout.id },
        ]"
        :style="{ animationDelay: `${index * 45}ms` }"
      >
        <div :class="LIST_ITEM_CONTENT_CLASS">
          <div class="flex flex-wrap items-center gap-2">
            <p :class="TEXT_HEADING_CLASS">{{ workout.name }}</p>
            <span
              class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
              :class="{
                'bg-bg-muted text-text-secondary': workout.status === 'PLANNED',
                'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200':
                  workout.status === 'IN_PROGRESS',
                'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200':
                  workout.status === 'COMPLETED',
              }"
            >
              {{ statusLabel(workout.status) }}
            </span>
          </div>
          <p v-if="workout.notes" class="mt-1 text-sm text-text-muted">{{ workout.notes }}</p>
          <time class="mt-1 block text-sm text-text-muted" :datetime="workout.date">
            {{ formatWorkoutDate(workout.date) }}
          </time>
        </div>

        <div class="flex shrink-0 items-center gap-1">
          <button
            v-if="canOpenSession(workout)"
            type="button"
            :class="BTN_ICON_GHOST_CLASS"
            :disabled="
              props.openingSessionWorkoutId === workout.id ||
              props.deletingWorkoutId === workout.id
            "
            :aria-label="sessionAriaLabel(workout)"
            @click="emit('session', workout)"
          >
            <LoadingSpinner
              v-if="props.openingSessionWorkoutId === workout.id"
              size="sm"
            />
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-5 w-5"
              aria-hidden="true"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>

          <ListItemIconActions
            :deleting="props.deletingWorkoutId === workout.id"
            :disabled="props.openingSessionWorkoutId === workout.id"
            @edit="emit('edit', workout)"
            @delete="emit('delete', workout)"
          />
        </div>
      </li>
    </ul>
  </section>
</template>
