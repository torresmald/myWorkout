<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import ExerciseHistoryChart from '@/components/exercise-history/ExerciseHistoryChart.vue'
import ExerciseHistorySessionCard from '@/components/exercise-history/ExerciseHistorySessionCard.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import {
  CARD_BODY_CLASS,
  SECTION_TITLE_CLASS,
  TEXT_MUTED_CLASS,
} from '@/constants/ui.constants'
import { useExerciseHistoryStore } from '@/stores/exercise-history.store'
import { useToastStore } from '@/stores/toast.store'
import { formatWorkoutDate } from '@/utils/date.util'
import { getErrorMessage } from '@/utils/error.util'

const route = useRoute()
const router = useRouter()
const historyStore = useExerciseHistoryStore()
const toastStore = useToastStore()
const { t } = useI18n()

const exerciseTypeId = computed(() => Number(route.params.id))

const { history, loading } = storeToRefs(historyStore)

const hasSessions = computed(() => (history.value?.sessions.length ?? 0) > 0)

async function loadHistory() {
  const id = exerciseTypeId.value

  if (!Number.isFinite(id)) {
    await router.replace({ name: 'exercise-types' })
    return
  }

  try {
    await historyStore.fetchByExerciseType(id)
  } catch (e) {
    toastStore.error(getErrorMessage(e, t('exerciseHistory.loadError')))
    await router.replace({ name: 'exercise-types' })
  }
}

onMounted(() => {
  void loadHistory()
})

onUnmounted(() => {
  historyStore.clear()
})
</script>

<template>
  <PageContainer>
    <div class="mb-6">
      <RouterLink
        to="/exercise-types"
        class="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        ← {{ t('exerciseHistory.backToExerciseTypes') }}
      </RouterLink>

      <h1 class="mt-2 text-xl font-semibold text-text-primary sm:text-2xl">
        {{ history?.exerciseType.name ?? t('exerciseHistory.title') }}
      </h1>

      <p v-if="history?.exerciseType.muscleGroup" :class="['mt-1', TEXT_MUTED_CLASS]">
        {{ history.exerciseType.muscleGroup }}
      </p>

      <p
        v-if="history?.personalRecord"
        class="mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200"
      >
        {{ t('personalRecords.badge') }}:
        {{
          t('personalRecords.repsAtWeight', {
            reps: history.personalRecord.reps,
            weight: history.personalRecord.maxWeight,
          })
        }}
        ·
        {{ t('personalRecords.achievedAt', { date: formatWorkoutDate(history.personalRecord.achievedAt) }) }}
      </p>
    </div>

    <section v-if="loading" :class="[CARD_BODY_CLASS, 'flex items-center justify-center gap-3']">
      <LoadingSpinner />
      <p :class="TEXT_MUTED_CLASS">{{ t('common.loading') }}</p>
    </section>

    <EmptyState
      v-else-if="history && !hasSessions"
      variant="exercises"
      :title="t('exerciseHistory.title')"
      :description="t('exerciseHistory.empty')"
      :action-label="t('exerciseHistory.emptyAction')"
      action-to="/workouts"
    />

    <template v-else-if="history">
      <section :class="[CARD_BODY_CLASS, 'mb-6']">
        <ExerciseHistoryChart
          :exercise-type-id="history.exerciseType.id"
          :exercise-name="history.exerciseType.name"
          :muscle-group="history.exerciseType.muscleGroup"
          :sessions="history.sessions"
        />
      </section>

      <section :class="CARD_BODY_CLASS">
        <h2 :class="SECTION_TITLE_CLASS">{{ t('exerciseHistory.sessionsTitle') }}</h2>

        <div class="space-y-4">
          <ExerciseHistorySessionCard
            v-for="session in history.sessions"
            :key="`${session.workoutId}-${session.workoutDate}`"
            :session="session"
          />
        </div>
      </section>
    </template>
  </PageContainer>
</template>
