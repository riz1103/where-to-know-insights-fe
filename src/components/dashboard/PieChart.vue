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
      <Doughnut :key="chartKey" :data="chartData" :options="chartOptions" :plugins="[centerPlugin]" />
    </div>
    <div v-else class="flex items-center justify-center h-72">
      <p class="text-sm text-gray-400">No data available</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import type { AnalyticsPoint } from '@/types/api'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  data: AnalyticsPoint[] | null
  loading: boolean
  error: string | null
  title: string
  subtitle?: string
  colors?: string[]
}

const props = defineProps<Props>()

const defaultColors = [
  '#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899',
]

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) return null
  const colorSet = props.colors ?? defaultColors
  return {
    labels: props.data.map((p) => p.key),
    datasets: [
      {
        data: props.data.map((p) => p.count),
        backgroundColor: colorSet.slice(0, props.data.length),
        borderWidth: 3,
        borderColor: '#fff',
        hoverOffset: 10,
      },
    ],
  }
})

const chartKey = computed(() =>
  props.data ? props.data.map((p) => `${p.key}-${p.count}`).join(',') : '0'
)

// Center label plugin
const centerPlugin = {
  id: 'centerText',
  beforeDraw(chart: any) {
    const { ctx, chartArea } = chart
    const dataset = chart.data.datasets[0]
    if (!dataset) return
    const total: number = (dataset.data as number[]).reduce((a, b) => a + b, 0)
    const cx = chartArea.left + (chartArea.right - chartArea.left) / 2
    const cy = chartArea.top + (chartArea.bottom - chartArea.top) / 2
    ctx.save()
    ctx.font = 'bold 24px Inter, system-ui, sans-serif'
    ctx.fillStyle = '#111827'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(total.toLocaleString(), cx, cy - 10)
    ctx.font = '12px Inter, system-ui, sans-serif'
    ctx.fillStyle = '#9ca3af'
    ctx.fillText('reviews', cx, cy + 14)
    ctx.restore()
  },
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  animation: { animateRotate: true, animateScale: true, duration: 900, easing: 'easeOutCubic' },
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 18,
        usePointStyle: true,
        pointStyleWidth: 9,
        font: { size: 12 },
        color: '#374151',
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15,23,42,0.92)',
      padding: 12,
      cornerRadius: 10,
      callbacks: {
        label: (ctx: any) => {
          const point = props.data?.[ctx.dataIndex]
          const total = props.data?.reduce((s, p) => s + p.count, 0) ?? 1
          const pct = ((ctx.parsed / total) * 100).toFixed(1)
          return [
            `  ${ctx.label}: ${ctx.parsed}`,
            `  Share : ${pct}%`,
            point ? `  Avg Score: ${point.avgScore.toFixed(1)} ⭐` : '',
          ]
        },
      },
    },
  },
}
</script>
