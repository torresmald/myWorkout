<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useWeightDisplay } from '@/composables/useWeightDisplay'
import type { ExerciseHistorySession } from '@/interfaces/exercise-history.interface'
import {
  CARD_COMPACT_CLASS,
  LIST_ITEM_CONTENT_CLASS,
  TEXT_HEADING_CLASS,
} from '@/constants/ui.constants'
import { formatListDate } from '@/utils/date.util'
import { convertWeightFromKg } from '@/utils/weight-unit.util'

defineProps<{
  session: ExerciseHistorySession
}>()

const { t } = useI18n()
const { formatWeight, unit } = useWeightDisplay()
const expanded = ref(false)

function formatSetWeight(weight: number | null) {
  return weight !== null && weight > 0
    ? t('exerciseHistory.setDetailWeight', { weight: formatWeight(weight) })
    : ''
}

function formatVolume(volumeKg: number) {
  const value =
    unit.value === 'lb'
      ? Math.round(convertWeightFromKg(volumeKg, 'lb'))
      : Math.round(volumeKg)
  return t('exerciseHistory.volume', { volume: `${value} ${unit.value}` })
}
</script>

<template>
  <article :class="CARD_COMPACT_CLASS">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div :class="LIST_ITEM_CONTENT_CLASS">
        <div class="flex flex-wrap items-center gap-2">
          <p :class="TEXT_HEADING_CLASS">{{ session.workoutName }}</p>
          <span
            v-if="session.isPersonalRecord"
            class="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200"
          >
            {{ t('personalRecords.badge') }}
          </span>
        </div>

        <time class="mt-1 block text-sm text-text-muted" :datetime="session.workoutDate">
          {{ formatListDate(session.workoutDate) }}
        </time>

        <p class="mt-2 text-sm text-text-primary">
          {{ t('exerciseHistory.setsSummary', { sets: session.sets, reps: session.reps }) }}
          <span v-if="session.maxWeight !== null">
            · {{ t('exerciseHistory.maxWeight', { weight: formatWeight(session.maxWeight) }) }}
          </span>
        </p>

        <p class="mt-1 text-sm text-text-muted">
          {{ formatVolume(session.volumeKg) }}
          ·
          {{
            session.source === 'LIVE'
              ? t('exerciseHistory.liveSession')
              : t('exerciseHistory.aggregateSession')
          }}
        </p>
      </div>

      <button
        v-if="session.setDetails.length > 0"
        type="button"
        class="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        @click="expanded = !expanded"
      >
        {{ expanded ? t('exerciseHistory.hideSets') : t('exerciseHistory.showSets') }}
      </button>
    </div>

    <ul v-if="expanded && session.setDetails.length > 0" class="mt-4 space-y-1 border-t border-border-default pt-4">
      <li
        v-for="set in session.setDetails"
        :key="set.setNumber"
        class="text-sm text-text-muted"
        :class="{ 'text-text-primary': set.completedAt !== null }"
      >
        {{
          t('exerciseHistory.setDetail', {
            number: set.setNumber,
            reps: set.reps,
            weight: formatSetWeight(set.weight),
          })
        }}
      </li>
    </ul>
  </article>
</template>
