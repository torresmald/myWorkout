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

import type { WeightEntryPublic } from '@/interfaces/profile.interface'
import { buildWeightChartData, buildWeightChartOptions } from '@/utils/weight-chart.util'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const props = defineProps<{
  entries: WeightEntryPublic[]
}>()

const chartData = computed(() => buildWeightChartData(props.entries))
const chartOptions = computed(() => buildWeightChartOptions(props.entries))
</script>

<template>
  <div class="h-64 w-full sm:h-80">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
