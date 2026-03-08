<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <div class="mb-5">
      <h3 class="text-base font-semibold text-gray-900">{{ title }}</h3>
      <p v-if="subtitle" class="text-xs text-gray-400 mt-0.5">{{ subtitle }}</p>
    </div>
    <div v-if="loading" class="flex flex-col items-center justify-center h-64 gap-3">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-blue-100 border-t-blue-500"></div>
      <p class="text-sm text-gray-400">Loading data…</p>
    </div>
    <div v-else-if="error" class="flex items-center justify-center h-64">
      <p class="text-sm text-red-500">{{ error }}</p>
    </div>
    <div v-else-if="chartData" class="h-64">
      <Bar :key="chartKey" :data="chartData" :options="chartOptions" />
    </div>
    <div v-else class="flex items-center justify-center h-64">
      <p class="text-sm text-gray-400">No data available</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import type { AnalyticsPoint } from '@/types/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface Props {
  data: AnalyticsPoint[] | null
  loading: boolean
  error: string | null
  title: string
  subtitle?: string
}

const props = defineProps<Props>()

const barPalette = [
  '#3b82f6', '#6366f1', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#0ea5e9',
  '#14b8a6', '#f97316',
]

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) return null
  const sorted = [...props.data].sort((a, b) => b.count - a.count)
  return {
    labels: sorted.map((p) => p.key),
    datasets: [
      {
        label: 'Reviews',
        data: sorted.map((p) => p.count),
        backgroundColor: sorted.map((_, i) => barPalette[i % barPalette.length] + 'cc'),
        borderColor: sorted.map((_, i) => barPalette[i % barPalette.length]),
        borderWidth: 0,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }
})

const chartKey = computed(() =>
  props.data ? props.data.map((p) => `${p.key}-${p.count}`).join(',') : '0'
)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 900, easing: 'easeOutCubic' },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(15,23,42,0.92)',
      padding: 12,
      cornerRadius: 10,
      callbacks: {
        label: (ctx: any) => {
          const point = props.data?.find((p) => p.key === ctx.label)
          return [
            `  Reviews : ${ctx.parsed.y}`,
            point ? `  Avg Score: ${point.avgScore.toFixed(1)} ⭐` : '',
          ]
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: '#9ca3af', font: { size: 11 }, maxRotation: 30 },
    },
    y: {
      beginAtZero: true,
      border: { display: false },
      grid: { color: 'rgba(0,0,0,0.04)' },
      ticks: { color: '#9ca3af', font: { size: 11 } },
    },
  },
}
</script>
