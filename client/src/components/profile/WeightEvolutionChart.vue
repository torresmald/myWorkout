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
import { useThemeStore } from '@/stores/theme.store'
import { buildWeightChartData, buildWeightChartOptions } from '@/utils/weight-chart.util'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const props = defineProps<{
  entries: WeightEntryPublic[]
}>()

const themeStore = useThemeStore()
const { preference } = storeToRefs(themeStore)

const isDark = computed(() => preference.value === 'dark')
const chartData = computed(() => buildWeightChartData(props.entries, isDark.value))
const chartOptions = computed(() => buildWeightChartOptions(props.entries, isDark.value))
</script>

<template>
  <div class="h-64 w-full sm:h-80">
    <Line :key="preference" :data="chartData" :options="chartOptions" />
  </div>
</template>
