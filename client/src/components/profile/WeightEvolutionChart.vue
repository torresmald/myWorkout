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
import { Line } from 'vue-chartjs'
import { storeToRefs } from 'pinia'

import type { WeightEntryPublic } from '@/interfaces/profile.interface'
import { useWeightUnitStore } from '@/stores/weight-unit.store'
import { useLocaleStore } from '@/stores/locale.store'
import { useThemeStore } from '@/stores/theme.store'
import { buildWeightChartData, buildWeightChartOptions } from '@/utils/weight-chart.util'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const props = defineProps<{
  entries: WeightEntryPublic[]
  targetWeightKg?: number | null
}>()

const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const weightUnitStore = useWeightUnitStore()
const { resolvedTheme } = storeToRefs(themeStore)
const { locale } = storeToRefs(localeStore)
const { unit } = storeToRefs(weightUnitStore)

const isDark = computed(() => resolvedTheme.value === 'dark')
const chartData = computed(() =>
  buildWeightChartData(props.entries, isDark.value, unit.value, props.targetWeightKg),
)
const chartOptions = computed(() =>
  buildWeightChartOptions(props.entries, isDark.value, unit.value, props.targetWeightKg),
)
</script>

<template>
  <div class="h-64 w-full sm:h-80">
    <Line :key="`${resolvedTheme}-${locale}-${unit}`" :data="chartData" :options="chartOptions" />
  </div>
</template>
