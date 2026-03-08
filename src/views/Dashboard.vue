<template>
  <div class="min-h-full bg-gradient-to-br from-slate-50 via-white to-blue-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-gray-900">Analytics Dashboard</h2>
          <p class="mt-1 text-gray-500">Hotel review insights and performance trends</p>
        </div>
        <div class="mt-4 sm:mt-0 flex items-center gap-3">
          <span class="text-sm text-gray-500">Period:</span>
          <SearchableSelect
            v-model="lastDays"
            :options="periodOptions"
            placeholder="Select period..."
            :show-all-option="false"
            @update:modelValue="handlePeriodChange"
            class="min-w-[160px]"
          />
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          v-for="stat in statCards"
          :key="stat.label"
          class="relative overflow-hidden rounded-2xl p-5 text-white shadow-md"
          :class="stat.gradient"
        >
          <p class="text-xs font-semibold uppercase tracking-wider opacity-70">{{ stat.label }}</p>
          <p class="mt-2 text-3xl font-extrabold leading-none">{{ stat.value }}</p>
          <p class="mt-1.5 text-xs opacity-60">{{ stat.sub }}</p>
          <!-- Decorative circles -->
          <div class="pointer-events-none absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/10"></div>
          <div class="pointer-events-none absolute -top-6 -right-10 h-24 w-24 rounded-full bg-white/5"></div>
        </div>
      </div>

      <!-- Row 1: Country bar + Traveler donut -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <BarChart
          :data="countryData?.points ?? null"
          :loading="countryLoading"
          :error="countryError"
          title="Reviews by Country"
          subtitle="Sorted by review volume — hover for avg score"
        />
        <PieChart
          :data="travelerTypeData?.points ?? null"
          :loading="travelerTypeLoading"
          :error="travelerTypeError"
          title="Traveler Type Distribution"
          subtitle="Who's leaving reviews"
        />
      </div>

      <!-- Row 2: Sentiment donut + Source donut -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PieChart
          :data="sentimentData?.points ?? null"
          :loading="sentimentLoading"
          :error="sentimentError"
          :colors="sentimentColors"
          title="Sentiment Breakdown"
          subtitle="Positive, neutral, and negative reviews"
        />
        <PieChart
          :data="sourceData?.points ?? null"
          :loading="sourceLoading"
          :error="sourceError"
          title="Reviews by Source"
          subtitle="Which platforms guests use"
        />
      </div>

      <!-- Row 3: Line chart full width -->
      <LineChart
        :data="monthData?.points ?? null"
        :loading="monthLoading"
        :error="monthError"
        title="Score & Volume Over Time"
        subtitle="Monthly average score (left) vs review count (right)"
      />

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BarChart from '@/components/dashboard/BarChart.vue'
import PieChart from '@/components/dashboard/PieChart.vue'
import LineChart from '@/components/dashboard/LineChart.vue'
import SearchableSelect from '@/components/common/SearchableSelect.vue'
import { useAnalytics } from '@/composables/useApi'
import { saveDashboardPeriod, loadDashboardPeriod } from '@/utils/sessionStorage'

const router = useRouter()
const route = useRoute()

// Initialize from URL or default
const getQueryParam = (key: string, defaultValue: number) => {
  const val = route.query[key]
  if (val === undefined || val === null) return defaultValue
  const num = Number(val)
  return isNaN(num) ? defaultValue : num
}

// Load from session storage or URL (URL takes priority)
const storedPeriod = loadDashboardPeriod()
const lastDays = ref(getQueryParam('days', storedPeriod ?? 30))

// Store reference to check in onMounted
const hasStoredPeriod = storedPeriod !== null

const periodOptions = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
  { value: 365, label: 'Last year' },
]

const { loading: countryLoading, error: countryError, data: countryData, fetchAnalytics: fetchCountry } = useAnalytics()
const { loading: travelerTypeLoading, error: travelerTypeError, data: travelerTypeData, fetchAnalytics: fetchTravelerType } = useAnalytics()
const { loading: monthLoading, error: monthError, data: monthData, fetchAnalytics: fetchMonth } = useAnalytics()
const { loading: sentimentLoading, error: sentimentError, data: sentimentData, fetchAnalytics: fetchSentiment } = useAnalytics()
const { loading: sourceLoading, error: sourceError, data: sourceData, fetchAnalytics: fetchSource } = useAnalytics()

// Update URL query params and save to session storage
const updateURL = () => {
  const query: Record<string, string> = {}
  if (lastDays.value !== 30) query.days = String(lastDays.value)
  router.replace({ query })
  
  // Save to session storage for persistence across navigation
  saveDashboardPeriod(lastDays.value)
}

const loadAllCharts = () => {
  updateURL()
  fetchCountry('country', lastDays.value)
  fetchTravelerType('travelerType', lastDays.value)
  fetchMonth('month', lastDays.value)
  fetchSentiment('sentiment', lastDays.value)
  fetchSource('source', lastDays.value)
}

const handlePeriodChange = (value: string | number | undefined) => {
  if (value !== undefined) {
    lastDays.value = Number(value)
    loadAllCharts()
  }
}

// Watch for route changes (browser back/forward)
let isUpdatingFromRoute = false
watch(() => route.query, (newQuery) => {
  const newDays = getQueryParam('days', 30)
  if (newDays !== lastDays.value) {
    isUpdatingFromRoute = true
    lastDays.value = newDays
    // Save to session storage when syncing from route
    saveDashboardPeriod(lastDays.value)
    // Load charts without updating URL (to avoid loop)
    fetchCountry('country', lastDays.value)
    fetchTravelerType('travelerType', lastDays.value)
    fetchMonth('month', lastDays.value)
    fetchSentiment('sentiment', lastDays.value)
    fetchSource('source', lastDays.value)
    isUpdatingFromRoute = false
  }
}, { immediate: false })

// Watch lastDays and update URL (only if not from route change)
watch(lastDays, () => {
  if (!isUpdatingFromRoute) {
    updateURL()
  }
})

// Sentiment-specific colors mapped by position in data
const sentimentColors = computed(() => {
  if (!sentimentData.value?.points) return undefined
  return sentimentData.value.points.map((p) => {
    if (p.key === 'Positive') return '#10b981'
    if (p.key === 'Negative') return '#ef4444'
    return '#6b7280'
  })
})

// Derived stat cards
const totalReviews = computed(() => countryData.value?.total ?? null)

const avgScore = computed(() => {
  const pts = countryData.value?.points
  if (!pts || pts.length === 0) return null
  const totalCount = pts.reduce((s, p) => s + p.count, 0)
  const weighted = pts.reduce((s, p) => s + p.avgScore * p.count, 0)
  return totalCount ? (weighted / totalCount).toFixed(2) : null
})

const topCountry = computed(() => {
  const pts = countryData.value?.points
  if (!pts || pts.length === 0) return null
  return [...pts].sort((a, b) => b.count - a.count)[0]
})

const topSentiment = computed(() => {
  const pts = sentimentData.value?.points
  if (!pts || pts.length === 0) return null
  return [...pts].sort((a, b) => b.count - a.count)[0]
})

const statCards = computed(() => [
  {
    label: 'Total Reviews',
    value: totalReviews.value !== null ? totalReviews.value.toLocaleString() : '—',
    sub: `in the last ${lastDays.value} days`,
    gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
  },
  {
    label: 'Avg Score',
    value: avgScore.value ? `${avgScore.value} ⭐` : '—',
    sub: 'weighted average',
    gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  },
  {
    label: 'Top Country',
    value: topCountry.value?.key ?? '—',
    sub: topCountry.value ? `${topCountry.value.count} reviews` : '',
    gradient: 'bg-gradient-to-br from-violet-500 to-purple-600',
  },
  {
    label: 'Top Sentiment',
    value: topSentiment.value?.key ?? '—',
    sub: topSentiment.value ? `${topSentiment.value.count} reviews` : '',
    gradient: 'bg-gradient-to-br from-amber-500 to-orange-500',
  },
])

onMounted(() => {
  // Check if we loaded from session storage (no URL params)
  const hasURLParams = route.query.days !== undefined
  if (!hasURLParams && hasStoredPeriod) {
    // Update URL to reflect stored value
    updateURL()
  }
  
  // Load charts with initial URL params
  loadAllCharts()
})
</script>
