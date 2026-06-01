<script setup lang="ts">
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { storeToRefs } from 'pinia'

import type { WeeklyStatPoint } from '@/interfaces/stats.interface'
import { useLocaleStore } from '@/stores/locale.store'
import { useThemeStore } from '@/stores/theme.store'
import {
  buildWeeklyVolumeChartData,
  buildWeeklyVolumeChartOptions,
} from '@/utils/stats-chart.util'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const props = defineProps<{
  weekly: WeeklyStatPoint[]
}>()

const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const { preference } = storeToRefs(themeStore)
const { locale } = storeToRefs(localeStore)

const isDark = computed(() => preference.value === 'dark')
const chartData = computed(() => buildWeeklyVolumeChartData(props.weekly))
const chartOptions = computed(() => buildWeeklyVolumeChartOptions(isDark.value))
</script>

<template>
  <div class="h-64 w-full sm:h-72">
    <Bar :key="`${preference}-${locale}`" :data="chartData" :options="chartOptions" />
  </div>
</template>
