<script setup lang="ts">
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Line } from 'vue-chartjs'
import { storeToRefs } from 'pinia'

import type { ExerciseHistorySession } from '@/interfaces/exercise-history.interface'
import type { ExerciseEvolutionSeries } from '@/interfaces/stats.interface'
import { SECTION_TITLE_CLASS, TEXT_MUTED_CLASS } from '@/constants/ui.constants'
import { useLocaleStore } from '@/stores/locale.store'
import { useThemeStore } from '@/stores/theme.store'
import { useWeightUnitStore } from '@/stores/weight-unit.store'
import {
  buildExerciseEvolutionChartData,
  buildExerciseEvolutionChartOptions,
  exerciseSeriesUsesWeight,
} from '@/utils/stats-chart.util'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const props = defineProps<{
  exerciseTypeId: number
  exerciseName: string
  muscleGroup: string | null
  sessions: ExerciseHistorySession[]
}>()

const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const weightUnitStore = useWeightUnitStore()
const { resolvedTheme } = storeToRefs(themeStore)
const { locale } = storeToRefs(localeStore)
const { unit } = storeToRefs(weightUnitStore)
const { t } = useI18n()

const chartSeries = computed<ExerciseEvolutionSeries>(() => ({
  exerciseTypeId: props.exerciseTypeId,
  exerciseName: props.exerciseName,
  muscleGroup: props.muscleGroup,
  dataPoints: [...props.sessions]
    .sort(
      (a, b) => new Date(a.workoutDate).getTime() - new Date(b.workoutDate).getTime(),
    )
    .map((session) => ({
      date: session.workoutDate,
      workoutId: session.workoutId,
      maxWeight: session.maxWeight,
      volumeKg: session.volumeKg,
      totalReps: session.totalReps,
    })),
}))

const isDark = computed(() => resolvedTheme.value === 'dark')
const chartData = computed(() =>
  buildExerciseEvolutionChartData(chartSeries.value, isDark.value, unit.value),
)
const chartOptions = computed(() =>
  buildExerciseEvolutionChartOptions(chartSeries.value, isDark.value, unit.value),
)
const usesWeight = computed(() => exerciseSeriesUsesWeight(chartSeries.value))
const hasEnoughData = computed(() => props.sessions.length >= 2)
</script>

<template>
  <section v-if="hasEnoughData">
    <h2 :class="SECTION_TITLE_CLASS">{{ t('exerciseHistory.chartTitle') }}</h2>

    <p v-if="!usesWeight" :class="['mb-4', TEXT_MUTED_CLASS]">
      {{ t('stats.evolution.needMoreData') }}
    </p>

    <div v-else class="h-64 w-full sm:h-80">
      <Line
        :key="`${resolvedTheme}-${locale}-${unit}-${exerciseTypeId}`"
        :data="chartData"
        :options="chartOptions"
      />
    </div>

    <p v-if="usesWeight" :class="['mt-4', TEXT_MUTED_CLASS]">
      {{ t('stats.evolution.trendMaxWeight') }}
    </p>
  </section>
</template>
