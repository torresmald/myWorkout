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
import type { WorkoutTemplatePublic } from '@/interfaces/template.interface'
import { formatWorkoutDate } from '@/utils/date.util'

const props = defineProps<{
  templates: WorkoutTemplatePublic[]
  loading: boolean
  editingTemplateId: number | null
  deletingTemplateId: number | null
  startingTemplateId: number | null
}>()

const emit = defineEmits<{
  edit: [template: WorkoutTemplatePublic]
  delete: [template: WorkoutTemplatePublic]
  start: [template: WorkoutTemplatePublic]
}>()

const { t } = useI18n()
</script>

<template>
  <section :class="CARD_BODY_CLASS">
    <h2 :class="SECTION_TITLE_CLASS">{{ t('templates.list.title') }}</h2>

    <SkeletonList v-if="props.loading" />

    <EmptyState
      v-else-if="props.templates.length === 0"
      variant="templates"
      :title="t('empty.templates.title')"
      :description="t('empty.templates.description')"
    />

    <ul v-else class="divide-y divide-border-default">
      <li
        v-for="(template, index) in props.templates"
        :key="template.id"
        :class="[
          LIST_ITEM_ROW_CLASS,
          'stagger-item',
          { 'rounded-lg bg-nav-active-bg px-3 -mx-3': props.editingTemplateId === template.id },
        ]"
        :style="{ animationDelay: `${index * 45}ms` }"
      >
        <div :class="LIST_ITEM_CONTENT_CLASS">
          <p :class="TEXT_HEADING_CLASS">{{ template.name }}</p>
          <p v-if="template.description" class="mt-1 text-sm text-text-muted">
            {{ template.description }}
          </p>
          <time class="mt-1 block text-sm text-text-muted" :datetime="template.updatedAt">
            {{ t('templates.list.updatedAt', { date: formatWorkoutDate(template.updatedAt) }) }}
          </time>
        </div>

        <div class="flex shrink-0 items-center gap-1">
          <button
            type="button"
            :class="BTN_ICON_GHOST_CLASS"
            :disabled="
              props.startingTemplateId === template.id ||
              props.deletingTemplateId === template.id
            "
            :aria-label="t('templates.list.startWorkout')"
            @click="emit('start', template)"
          >
            <LoadingSpinner
              v-if="props.startingTemplateId === template.id"
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
            :deleting="props.deletingTemplateId === template.id"
            :disabled="props.startingTemplateId === template.id"
            @edit="emit('edit', template)"
            @delete="emit('delete', template)"
          />
        </div>
      </li>
    </ul>
  </section>
</template>
