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
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Line } from 'vue-chartjs'
import { storeToRefs } from 'pinia'

import EmptyState from '@/components/ui/EmptyState.vue'
import type { ExerciseEvolutionSeries } from '@/interfaces/stats.interface'
import { INPUT_CLASS, LABEL_CLASS, TEXT_MUTED_CLASS } from '@/constants/ui.constants'
import { useLocaleStore } from '@/stores/locale.store'
import { useThemeStore } from '@/stores/theme.store'
import {
  buildExerciseEvolutionChartData,
  buildExerciseEvolutionChartOptions,
  exerciseSeriesUsesWeight,
} from '@/utils/stats-chart.util'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const props = defineProps<{
  seriesList: ExerciseEvolutionSeries[]
}>()

const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const { preference } = storeToRefs(themeStore)
const { locale } = storeToRefs(localeStore)
const { t } = useI18n()

const selectedExerciseTypeId = ref<number | null>(null)

watch(
  () => props.seriesList,
  (seriesList) => {
    selectedExerciseTypeId.value = seriesList[0]?.exerciseTypeId ?? null
  },
  { immediate: true },
)

const selectedSeries = computed(
  () =>
    props.seriesList.find((series) => series.exerciseTypeId === selectedExerciseTypeId.value) ??
    null,
)

const isDark = computed(() => preference.value === 'dark')
const chartData = computed(() => buildExerciseEvolutionChartData(selectedSeries.value, isDark.value))
const chartOptions = computed(() =>
  buildExerciseEvolutionChartOptions(selectedSeries.value, isDark.value),
)

const usesWeight = computed(() => exerciseSeriesUsesWeight(selectedSeries.value))

const trendDescription = computed(() =>
  usesWeight.value ? t('stats.evolution.trendMaxWeight') : t('stats.evolution.trendReps'),
)
</script>

<template>
  <EmptyState
    v-if="seriesList.length === 0"
    variant="stats"
    :title="t('empty.stats.title')"
    :description="t('stats.evolution.empty')"
    :action-label="t('empty.stats.action')"
    action-to="/workouts"
  />

  <div v-else class="space-y-4">
    <div>
      <label for="exercise-evolution-select" :class="LABEL_CLASS">
        {{ t('stats.evolution.exerciseLabel') }}
      </label>
      <select
        id="exercise-evolution-select"
        v-model.number="selectedExerciseTypeId"
        :class="INPUT_CLASS"
      >
        <option v-for="series in seriesList" :key="series.exerciseTypeId" :value="series.exerciseTypeId">
          {{ series.exerciseName }}
          {{ series.muscleGroup ? `(${series.muscleGroup})` : '' }}
        </option>
      </select>
    </div>

    <p v-if="selectedSeries && selectedSeries.dataPoints.length < 2" :class="TEXT_MUTED_CLASS">
      {{ t('stats.evolution.needMoreData') }}
    </p>

    <div v-else class="h-64 w-full sm:h-80">
      <Line
        :key="`${preference}-${locale}-${selectedExerciseTypeId}`"
        :data="chartData"
        :options="chartOptions"
      />
    </div>

    <p v-if="selectedSeries && selectedSeries.dataPoints.length >= 2" :class="TEXT_MUTED_CLASS">
      {{ trendDescription }}
    </p>
  </div>
</template>
