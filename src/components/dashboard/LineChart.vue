<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <div class="mb-5">
      <h3 class="text-base font-semibold text-gray-900">{{ title }}</h3>
      <p v-if="subtitle" class="text-xs text-gray-400 mt-0.5">{{ subtitle }}</p>
    </div>
    <div v-if="loading" class="flex flex-col items-center justify-center h-72 gap-3">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-blue-100 border-t-blue-500"></div>
      <p class="text-sm text-gray-400">Loading data…</p>
    </div>
    <div v-else-if="error" class="flex items-center justify-center h-72">
      <p class="text-sm text-red-500">{{ error }}</p>
    </div>
    <div v-else-if="chartData" class="h-72">
      <Line :key="chartKey" :data="chartData" :options="chartOptions" />
    </div>
    <div v-else class="flex items-center justify-center h-72">
      <p class="text-sm text-gray-400">No data available</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import type { AnalyticsPoint } from '@/types/api'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, Tooltip, Legend)

interface Props {
  data: AnalyticsPoint[] | null
  loading: boolean
  error: string | null
  title: string
  subtitle?: string
}

const props = defineProps<Props>()

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) return null
  return {
    labels: props.data.map((p) => p.key),
    datasets: [
      {
        label: 'Avg Score',
        data: props.data.map((p) => p.avgScore),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.08)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#3b82f6',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        yAxisID: 'y',
      },
      {
        label: 'Review Count',
        data: props.data.map((p) => p.count),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.06)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#10b981',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        yAxisID: 'y1',
      },
    ],
  }
})

const chartKey = computed(() =>
  props.data ? props.data.map((p) => `${p.key}-${p.count}-${p.avgScore}`).join(',') : '0'
)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 900, easing: 'easeOutCubic' },
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: { usePointStyle: true, padding: 20, font: { size: 12 }, color: '#374151' },
    },
    tooltip: {
      backgroundColor: 'rgba(15,23,42,0.92)',
      padding: 12,
      cornerRadius: 10,
      callbacks: {
        label: (ctx: any) =>
          ctx.datasetIndex === 0
            ? `  Avg Score : ${ctx.parsed.y.toFixed(2)} ⭐`
            : `  Review Count: ${ctx.parsed.y}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: '#9ca3af', font: { size: 11 } },
    },
    y: {
      type: 'linear' as const,
      position: 'left' as const,
      min: 1,
      max: 5,
      border: { display: false },
      grid: { color: 'rgba(0,0,0,0.04)' },
      ticks: { color: '#9ca3af', font: { size: 11 } },
      title: { display: true, text: 'Avg Score', color: '#9ca3af', font: { size: 11 } },
    },
    y1: {
      type: 'linear' as const,
      position: 'right' as const,
      beginAtZero: true,
      border: { display: false },
      grid: { drawOnChartArea: false },
      ticks: { color: '#9ca3af', font: { size: 11 } },
      title: { display: true, text: 'Count', color: '#9ca3af', font: { size: 11 } },
    },
  },
}
</script>
