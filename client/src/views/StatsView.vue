<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import ExerciseEvolutionChart from '@/components/stats/ExerciseEvolutionChart.vue'
import WeeklyFrequencyChart from '@/components/stats/WeeklyFrequencyChart.vue'
import WeeklyVolumeChart from '@/components/stats/WeeklyVolumeChart.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import RoutePageHeader from '@/components/layout/RoutePageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import SkeletonCardGrid from '@/components/ui/SkeletonCardGrid.vue'
import { CARD_BODY_CLASS, CARD_COMPACT_CLASS, SECTION_TITLE_CLASS, TEXT_MUTED_CLASS } from '@/constants/ui.constants'
import { useStatsStore } from '@/stores/stats.store'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/utils/error.util'

const statsStore = useStatsStore()
const toastStore = useToastStore()
const { t } = useI18n()

const { stats, loading } = storeToRefs(statsStore)

const summaryCards = computed(() => [
  { key: 'workoutsThisWeek' as const, label: t('stats.summary.workoutsThisWeek'), suffix: t('stats.summary.workoutsSuffix') },
  { key: 'workoutsLast30Days' as const, label: t('stats.summary.workoutsLast30Days'), suffix: t('stats.summary.workoutsSuffix') },
  { key: 'totalWorkouts' as const, label: t('stats.summary.totalWorkouts'), suffix: t('stats.summary.workoutsShortSuffix') },
  { key: 'totalVolumeKg' as const, label: t('stats.summary.totalVolumeKg'), suffix: t('stats.summary.kgSuffix') },
  { key: 'totalReps' as const, label: t('stats.summary.totalReps'), suffix: '' },
])

const hasWorkouts = computed(() => (stats.value?.summary.totalWorkouts ?? 0) > 0)

onMounted(async () => {
  try {
    await statsStore.fetchStats()
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('stats.loadError')))
  }
})
</script>

<template>
  <PageContainer>
    <RoutePageHeader />

    <SkeletonCardGrid v-if="loading && !stats" />

    <EmptyState
      v-else-if="stats && !hasWorkouts"
      variant="stats"
      :title="t('empty.stats.title')"
      :description="t('empty.stats.description')"
      :action-label="t('empty.stats.action')"
      action-to="/workouts"
    />

    <template v-else-if="stats">
      <div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(card, index) in summaryCards"
          :key="card.key"
          :class="[CARD_COMPACT_CLASS, 'stagger-item']"
          :style="{ animationDelay: `${index * 50}ms` }"
        >
          <p :class="TEXT_MUTED_CLASS">{{ card.label }}</p>
          <p class="mt-1 text-2xl font-bold text-text-primary">
            {{ stats.summary[card.key] }}{{ card.suffix }}
          </p>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <section :class="[CARD_BODY_CLASS, 'stagger-item']" style="animation-delay: 250ms">
          <h2 :class="SECTION_TITLE_CLASS">{{ t('stats.frequency.title') }}</h2>
          <p :class="['mb-4', TEXT_MUTED_CLASS]">{{ t('stats.frequency.description') }}</p>
          <WeeklyFrequencyChart :weekly="stats.weekly" />
        </section>

        <section :class="[CARD_BODY_CLASS, 'stagger-item']" style="animation-delay: 300ms">
          <h2 :class="SECTION_TITLE_CLASS">{{ t('stats.volume.title') }}</h2>
          <p :class="['mb-4', TEXT_MUTED_CLASS]">{{ t('stats.volume.description') }}</p>
          <WeeklyVolumeChart :weekly="stats.weekly" />
        </section>
      </div>

      <section :class="[CARD_BODY_CLASS, 'mt-6 stagger-item']" style="animation-delay: 350ms">
        <h2 :class="SECTION_TITLE_CLASS">{{ t('stats.evolution.title') }}</h2>
        <ExerciseEvolutionChart :series-list="stats.exerciseEvolution" />
      </section>
    </template>
  </PageContainer>
</template>
