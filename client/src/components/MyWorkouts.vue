<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import EmptyState from '@/components/ui/EmptyState.vue'
import ListItemIconActions from '@/components/ui/ListItemIconActions.vue'
import SkeletonList from '@/components/ui/SkeletonList.vue'
import {
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
}>()

const emit = defineEmits<{
  edit: [workout: WorkoutPublic]
  delete: [workout: WorkoutPublic]
}>()

const { t } = useI18n()
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
