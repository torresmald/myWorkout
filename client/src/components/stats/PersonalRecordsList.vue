<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import EmptyState from '@/components/ui/EmptyState.vue'
import SkeletonList from '@/components/ui/SkeletonList.vue'
import {
  CARD_BODY_CLASS,
  LIST_ITEM_CONTENT_CLASS,
  LIST_ITEM_ROW_CLASS,
  SECTION_TITLE_CLASS,
  TEXT_HEADING_CLASS,
  TEXT_MUTED_CLASS,
} from '@/constants/ui.constants'
import type { PersonalRecordPublic } from '@/interfaces/personal-record.interface'
import { formatWorkoutDate } from '@/utils/date.util'

defineProps<{
  records: PersonalRecordPublic[]
  loading: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <section :class="CARD_BODY_CLASS">
    <h2 :class="SECTION_TITLE_CLASS">{{ t('personalRecords.title') }}</h2>
    <p :class="['mb-4', TEXT_MUTED_CLASS]">{{ t('personalRecords.description') }}</p>

    <SkeletonList v-if="loading" />

    <EmptyState
      v-else-if="records.length === 0"
      variant="stats"
      :title="t('personalRecords.title')"
      :description="t('personalRecords.empty')"
    />

    <ul v-else class="divide-y divide-border-default">
      <li
        v-for="(record, index) in records"
        :key="record.exerciseTypeId"
        :class="[LIST_ITEM_ROW_CLASS, 'stagger-item']"
        :style="{ animationDelay: `${index * 45}ms` }"
      >
        <div :class="LIST_ITEM_CONTENT_CLASS">
          <div class="flex flex-wrap items-center gap-2">
            <RouterLink
              :to="{ name: 'exercise-history', params: { id: record.exerciseTypeId } }"
              :class="TEXT_HEADING_CLASS"
              class="hover:text-blue-600 dark:hover:text-blue-400"
            >
              {{ record.exerciseName }}
            </RouterLink>
            <span
              class="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200"
            >
              {{ t('personalRecords.badge') }}
            </span>
          </div>

          <p class="mt-1 text-sm font-medium text-text-primary">
            {{
              t('personalRecords.repsAtWeight', {
                reps: record.reps,
                weight: record.maxWeight,
              })
            }}
          </p>

          <p class="mt-1 text-sm text-text-muted">
            {{ record.workoutName }} ·
            {{ t('personalRecords.achievedAt', { date: formatWorkoutDate(record.achievedAt) }) }}
          </p>

          <span
            v-if="record.muscleGroup"
            class="mt-2 inline-flex w-fit rounded-full bg-bg-muted px-2.5 py-0.5 text-xs font-medium text-text-secondary"
          >
            {{ record.muscleGroup }}
          </span>
        </div>
      </li>
    </ul>
  </section>
</template>
