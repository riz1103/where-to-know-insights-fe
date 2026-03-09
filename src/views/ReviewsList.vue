<template>
  <div class="min-h-full bg-gradient-to-br from-slate-50 via-white to-blue-50">
    <div :class="viewMode === 'table' ? 'max-w-7xl' : 'max-w-5xl'" class="mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-3xl font-bold tracking-tight text-gray-900">Guest Reviews</h2>
        <p class="mt-1 text-gray-500">
          <template v-if="data && !loading">
            <span class="font-semibold text-gray-700">{{ data.total.toLocaleString() }}</span> reviews found
          </template>
          <template v-else>Explore hotel reviews from travellers around the world</template>
        </p>
      </div>

      <!-- Search Bar -->
      <div class="relative mb-5">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          v-model="filters.q"
          @input="handleSearchInput"
          type="text"
          placeholder="Search hotels, destinations, keywords…"
          class="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-gray-200 bg-white shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
        />
        <button
          v-if="filters.q"
          @click="clearSearch"
          class="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 transition"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Controls Bar -->
      <div class="flex flex-wrap items-center gap-3 mb-4">
        <!-- View Toggle -->
        <div class="flex items-center gap-1 bg-gray-100 rounded-xl p-1 border border-gray-200">
          <button
            @click="viewMode = 'table'"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition"
            :class="viewMode === 'table'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'"
          >
            <svg class="inline-block w-4 h-4 mr-1.5 align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Table
          </button>
          <button
            @click="viewMode = 'cards'"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition"
            :class="viewMode === 'cards'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'"
          >
            <svg class="inline-block w-4 h-4 mr-1.5 align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Cards
          </button>
        </div>

        <!-- Filter Toggle -->
        <button
          @click="showFilters = !showFilters"
          class="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition"
          :class="showFilters || activeFilterCount > 0
            ? 'bg-blue-50 border-blue-300 text-blue-700'
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filters
          <span
            v-if="activeFilterCount > 0"
            class="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-blue-500 text-white rounded-full"
          >{{ activeFilterCount }}</span>
        </button>

        <!-- Sort (only show in card view) -->
        <SearchableSelect
          v-if="viewMode === 'cards'"
          v-model="sort"
          :options="sortOptions"
          placeholder="Sort by..."
          :show-all-option="false"
          @update:modelValue="handleFilterChange"
          class="min-w-[160px]"
        />

        <!-- Page size -->
        <SearchableSelect
          v-model="pageSize"
          :options="pageSizeOptions"
          placeholder="Items per page"
          :show-all-option="false"
          @update:modelValue="handlePageSizeChange"
          class="min-w-[140px]"
        />

        <!-- Clear all -->
        <button
          v-if="activeFilterCount > 0"
          @click="clearAllFilters"
          class="px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 border border-rose-100 transition"
        >✕ Clear all</button>

        <!-- Results count -->
        <div class="ml-auto text-sm text-gray-400" v-if="data && !loading">
          {{ (data.page - 1) * data.pageSize + 1 }}–{{ Math.min(data.page * data.pageSize, data.total) }}
          of {{ data.total.toLocaleString() }}
        </div>
      </div>

      <!-- Filter Panel -->
      <FilterPanel
        :show="showFilters"
        :filters="filters"
        :country-options="countryOptions"
        :traveler-options="travelerOptions"
        :source-options="sourceOptions"
        :sentiment-options="sentimentOptions"
        @update:filter="handleFilterUpdate"
        @update:error="scoreRangeError = $event"
      />

      <!-- Validation Error Banner -->
      <div v-if="scoreRangeError" class="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-3">
        <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div class="flex-1">
          <p class="text-sm font-medium text-red-800">{{ scoreRangeError }}</p>
          <p class="text-xs text-red-600 mt-0.5">Please fix the score range to continue filtering.</p>
        </div>
        <button
          @click="clearFilter('minScore'); clearFilter('maxScore')"
          class="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Clear
        </button>
      </div>

      <!-- Active Filter Chips -->
      <div v-if="activeFilterCount > 0" class="flex flex-wrap gap-2 mb-4">
        <button v-if="filters.country" @click="clearFilter('country')" class="chip">📍 {{ filters.country }} ×</button>
        <button v-if="filters.travelerType" @click="clearFilter('travelerType')" class="chip">{{ travelerIcon(filters.travelerType) }} {{ filters.travelerType }} ×</button>
        <button v-if="filters.source" @click="clearFilter('source')" class="chip">{{ filters.source }} ×</button>
        <button v-if="filters.sentiment" @click="clearFilter('sentiment')" class="chip">{{ sentimentEmoji(filters.sentiment) }} {{ filters.sentiment }} ×</button>
        <button
          v-if="filters.minScore && filters.minScore >= 1 && filters.minScore <= 5"
          @click="clearFilter('minScore')"
          class="chip"
        >Min ⭐ {{ filters.minScore }} ×</button>
        <button
          v-if="filters.maxScore && filters.maxScore >= 1 && filters.maxScore <= 5 && (!filters.minScore || filters.maxScore >= filters.minScore)"
          @click="clearFilter('maxScore')"
          class="chip"
        >Max ⭐ {{ filters.maxScore }} ×</button>
      </div>

      <!-- Loading: Skeleton Cards -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 6" :key="i" class="bg-white rounded-2xl shadow-sm p-5 animate-pulse border border-gray-50">
          <div class="flex justify-between gap-4">
            <div class="flex-1">
              <div class="h-4 bg-gray-200 rounded-lg w-2/3 mb-3"></div>
              <div class="flex gap-2">
                <div class="h-3 bg-gray-100 rounded-full w-20"></div>
                <div class="h-3 bg-gray-100 rounded-full w-16"></div>
                <div class="h-3 bg-gray-100 rounded-full w-14"></div>
              </div>
            </div>
            <div class="flex flex-col items-end gap-2 w-28">
              <div class="h-4 bg-gray-200 rounded w-full"></div>
              <div class="h-3 bg-gray-100 rounded w-3/4"></div>
              <div class="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-gray-50 flex justify-end">
            <div class="h-3 bg-gray-100 rounded w-24"></div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
        <div class="text-5xl mb-3">⚠️</div>
        <h3 class="font-semibold text-red-800 mb-1">Failed to load reviews</h3>
        <p class="text-red-500 text-sm mb-5">{{ error }}</p>
        <button
          @click="loadReviews"
          class="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition"
        >Try again</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="!data || data.items.length === 0" class="text-center py-16">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No reviews found</h3>
        <p class="text-gray-500 text-sm max-w-xs mx-auto">Try adjusting your filters or searching for something different.</p>
        <button
          @click="clearAllFilters"
          class="mt-6 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition shadow-sm"
        >Clear all filters</button>
      </div>

      <!-- Table View -->
      <ReviewTable
        v-if="viewMode === 'table' && data"
        :reviews="data.items"
        :current-sort="sort"
        @sort="handleSort"
        @row-click="goToDetail"
      />

      <!-- Card View -->
      <div v-else-if="data" class="space-y-4">
        <ReviewCard
          v-for="review in data.items"
          :key="review.id"
          :review="review"
          @click="goToDetail(review.id)"
        />
      </div>

      <!-- Pagination -->
      <div v-if="data && data.totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
        <button
          @click="goToPage(data.page - 1)"
          :disabled="!data.hasPrev"
          class="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >← Prev</button>

        <template v-for="pg in pageNumbers" :key="String(pg) + '-pag'">
          <span v-if="pg === '...'" class="px-1 text-gray-400 text-sm select-none">…</span>
          <button
            v-else
            @click="goToPage(Number(pg))"
            class="w-10 h-10 rounded-xl text-sm font-medium transition"
            :class="Number(pg) === data.page
              ? 'bg-blue-600 text-white shadow-sm'
              : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'"
          >{{ pg }}</button>
        </template>

        <button
          @click="goToPage(data.page + 1)"
          :disabled="!data.hasNext"
          class="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >Next →</button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useReviews, useAnalytics } from 'where-to-know-insights-lib/composables'
import type { ReviewsQueryParams } from 'where-to-know-insights-lib/types'
import { SearchableSelect, ReviewTable, ReviewCard, FilterPanel } from 'where-to-know-insights-lib/components'
import {
  saveReviewsFilters,
  loadReviewsFilters,
  clearReviewsFilters,
  saveReviewsPagination,
  loadReviewsPagination,
  type ReviewsFilters,
} from 'where-to-know-insights-lib/utils'

const router = useRouter()
const route = useRoute()
const { loading, error, data, fetchReviews } = useReviews()
const { data: countriesData, fetchAnalytics: fetchCountries } = useAnalytics()

// Fetch available countries from analytics
const availableCountries = computed(() => {
  if (!countriesData.value?.points) return []
  return countriesData.value.points
    .map(p => p.key)
    .sort((a, b) => a.localeCompare(b))
})

// Options for searchable selects
const countryOptions = computed(() =>
  availableCountries.value.map(country => ({
    value: country,
    label: country,
  }))
)

const travelerOptions = [
  { value: 'Business', label: '💼 Business' },
  { value: 'Couple', label: '💑 Couple' },
  { value: 'Family', label: '👨‍👩‍👧 Family' },
  { value: 'Solo', label: '🎒 Solo' },
  { value: 'Friends', label: '👥 Friends' },
]

const sourceOptions = [
  { value: 'Booking', label: 'Booking' },
  { value: 'Google', label: 'Google' },
  { value: 'Tripadvisor', label: 'Tripadvisor' },
  { value: 'Agoda', label: 'Agoda' },
  { value: 'Expedia', label: 'Expedia' },
]

const sentimentOptions = [
  { value: 'Positive', label: '😊 Positive' },
  { value: 'Neutral', label: '😐 Neutral' },
  { value: 'Negative', label: '😞 Negative' },
]

const sortOptions = [
  { value: 'createdAt_desc', label: '🕐 Newest first' },
  { value: 'createdAt_asc', label: '🕐 Oldest first' },
  { value: 'score_desc', label: '⭐ Highest score' },
  { value: 'score_asc', label: '⭐ Lowest score' },
  { value: 'hotelName_asc', label: '🏨 Hotel name (A-Z)' },
  { value: 'hotelName_desc', label: '🏨 Hotel name (Z-A)' },
  { value: 'country_asc', label: '📍 Country (A-Z)' },
  { value: 'country_desc', label: '📍 Country (Z-A)' },
  { value: 'travelerType_asc', label: '👤 Traveler type (A-Z)' },
  { value: 'travelerType_desc', label: '👤 Traveler type (Z-A)' },
  { value: 'source_asc', label: '📱 Source (A-Z)' },
  { value: 'source_desc', label: '📱 Source (Z-A)' },
  { value: 'sentiment_asc', label: '😊 Sentiment (A-Z)' },
  { value: 'sentiment_desc', label: '😊 Sentiment (Z-A)' },
]

const pageSizeOptions = [
  { value: 10, label: '10 per page' },
  { value: 20, label: '20 per page' },
  { value: 50, label: '50 per page' },
]

// Initialize from URL or defaults
const getQueryParam = (key: string, defaultValue: string | number) => {
  const val = route.query[key]
  if (val === undefined || val === null) return defaultValue
  if (typeof defaultValue === 'number') {
    const num = Number(val)
    return isNaN(num) ? defaultValue : num
  }
  return String(val)
}

// Load from session storage or URL (URL takes priority)
const storedPagination = loadReviewsPagination()
const storedFilters = loadReviewsFilters()

// URL params take priority over stored values
const page = ref(getQueryParam('page', storedPagination?.page ?? 1) as number)
const pageSize = ref(getQueryParam('pageSize', storedPagination?.pageSize ?? 20) as number)
const sort = ref(getQueryParam('sort', storedPagination?.sort ?? 'createdAt_desc') as string)
const showFilters = ref(false)
const viewMode = ref<'table' | 'cards'>(
  (getQueryParam('view', storedPagination?.viewMode ?? 'table') as 'table' | 'cards') || 'table'
)

const filters = ref<ReviewsFilters>({
  country: getQueryParam('country', storedFilters?.country ?? '') as string,
  travelerType: getQueryParam('travelerType', storedFilters?.travelerType ?? '') as string,
  source: getQueryParam('source', storedFilters?.source ?? '') as string,
  sentiment: getQueryParam('sentiment', storedFilters?.sentiment ?? '') as string,
  minScore: getQueryParam('minScore', '') as string
    ? Number(getQueryParam('minScore', ''))
    : (storedFilters?.minScore ?? undefined),
  maxScore: getQueryParam('maxScore', '') as string
    ? Number(getQueryParam('maxScore', ''))
    : (storedFilters?.maxScore ?? undefined),
  q: getQueryParam('q', storedFilters?.q ?? '') as string,
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null
let isUpdatingFromRoute = false

// Validation
const scoreRangeError = ref<string | null>(null)

const validateScoreRange = () => {
  scoreRangeError.value = null
  
  const min = filters.value.minScore
  const max = filters.value.maxScore
  
  // If both are set, validate range
  if (min !== undefined && max !== undefined) {
    // Validate bounds
    if (min < 1 || min > 5) {
      scoreRangeError.value = 'Min score must be between 1 and 5'
      return false
    }
    if (max < 1 || max > 5) {
      scoreRangeError.value = 'Max score must be between 1 and 5'
      return false
    }
    
    // Validate min <= max
    if (min > max) {
      scoreRangeError.value = 'Min score cannot be greater than max score'
      // Auto-swap if user clearly meant the opposite
      if (min <= 5 && max >= 1) {
        // Fix by setting both to the higher value
        const higherValue = filters.value.minScore
        filters.value.minScore = higherValue
        filters.value.maxScore = higherValue
        scoreRangeError.value = 'Swapped min/max values automatically'
        setTimeout(() => {
          scoreRangeError.value = null
        }, 2000)
      }
      return false
    }
  }
  
  // Validate individual values
  if (min !== undefined && (min < 1 || min > 5)) {
    scoreRangeError.value = 'Min score must be between 1 and 5'
    return false
  }
  if (max !== undefined && (max < 1 || max > 5)) {
    scoreRangeError.value = 'Max score must be between 1 and 5'
    return false
  }
  
  return true
}

const validateFilters = () => {
  // Validate score range
  if (!validateScoreRange()) {
    return false
  }
  
  return true
}

// Update URL query params and save to session storage
const updateURL = () => {
  if (isUpdatingFromRoute) return // Don't update URL when syncing from route
  
  // Validate before updating URL
  validateFilters()
  
  const query: Record<string, string> = {}
  
  if (page.value > 1) query.page = String(page.value)
  if (pageSize.value !== 20) query.pageSize = String(pageSize.value)
  if (sort.value !== 'createdAt_desc') query.sort = sort.value
  if (viewMode.value !== 'table') query.view = viewMode.value
  
  if (filters.value.country) query.country = filters.value.country
  if (filters.value.travelerType) query.travelerType = filters.value.travelerType
  if (filters.value.source) query.source = filters.value.source
  if (filters.value.sentiment) query.sentiment = filters.value.sentiment
  
  // Only add valid score filters to URL
  if (filters.value.minScore !== undefined && filters.value.minScore >= 1 && filters.value.minScore <= 5) {
    query.minScore = String(filters.value.minScore)
  }
  if (filters.value.maxScore !== undefined && filters.value.maxScore >= 1 && filters.value.maxScore <= 5) {
    // Only add maxScore if it's valid AND >= minScore (if minScore is also set)
    if (!filters.value.minScore || filters.value.maxScore >= filters.value.minScore) {
      query.maxScore = String(filters.value.maxScore)
    }
  }
  
  if (filters.value.q) query.q = filters.value.q
  
  router.replace({ query })
  
  // Save to session storage for persistence across navigation
  saveReviewsFilters(filters.value)
  saveReviewsPagination({
    page: page.value,
    pageSize: pageSize.value,
    sort: sort.value,
    viewMode: viewMode.value,
  })
}

// Watch for route changes (browser back/forward)
watch(() => route.query, (newQuery) => {
  isUpdatingFromRoute = true
  page.value = getQueryParam('page', 1) as number
  pageSize.value = getQueryParam('pageSize', 20) as number
  sort.value = getQueryParam('sort', 'createdAt_desc') as string
  viewMode.value = (getQueryParam('view', 'table') as 'table' | 'cards') || 'table'
  
  // Parse and validate score filters from URL
  const minScoreParam = getQueryParam('minScore', '') as string
  const maxScoreParam = getQueryParam('maxScore', '') as string
  let minScore: number | undefined = minScoreParam ? Number(minScoreParam) : undefined
  let maxScore: number | undefined = maxScoreParam ? Number(maxScoreParam) : undefined
  
  // Validate and sanitize score filters
  if (minScore !== undefined && (isNaN(minScore) || minScore < 1 || minScore > 5)) {
    minScore = undefined
  }
  if (maxScore !== undefined && (isNaN(maxScore) || maxScore < 1 || maxScore > 5)) {
    maxScore = undefined
  }
  // If both are set, ensure min <= max
  if (minScore !== undefined && maxScore !== undefined && minScore > maxScore) {
    // Set both to the higher value to maintain valid range
    const higherValue = minScore
    minScore = higherValue
    maxScore = higherValue
    // Update URL with corrected values
    setTimeout(() => {
      updateURL()
    }, 100)
  }
  
  filters.value = {
    country: getQueryParam('country', '') as string,
    travelerType: getQueryParam('travelerType', '') as string,
    source: getQueryParam('source', '') as string,
    sentiment: getQueryParam('sentiment', '') as string,
    minScore,
    maxScore,
    q: getQueryParam('q', '') as string,
  }
  
  // Validate after setting filters
  validateFilters()
  
  // Save to session storage when syncing from route
  saveReviewsFilters(filters.value)
  saveReviewsPagination({
    page: page.value,
    pageSize: pageSize.value,
    sort: sort.value,
    viewMode: viewMode.value,
  })
  
  loadReviews()
  isUpdatingFromRoute = false
}, { immediate: false })

// ─── Computed ──────────────────────────────────────────
const activeFilterCount = computed(() => {
  let n = 0
  if (filters.value.country) n++
  if (filters.value.travelerType) n++
  if (filters.value.source) n++
  if (filters.value.sentiment) n++
  if (filters.value.minScore) n++
  if (filters.value.maxScore) n++
  return n
})

const pageNumbers = computed((): (number | string)[] => {
  if (!data.value) return []
  const total = data.value.totalPages
  const cur = data.value.page
  const set = new Set([1, total, cur, cur - 1, cur + 1].filter((p) => p >= 1 && p <= total))
  const sorted = [...set].sort((a, b) => a - b)
  const result: (number | string)[] = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) result.push('...')
    result.push(p)
    prev = p
  }
  return result
})

// ─── Handlers ──────────────────────────────────────────
// Debounce timeout for filter changes
let filterTimeout: ReturnType<typeof setTimeout> | null = null

const handleFilterChange = () => {
  page.value = 1
  updateURL()
  
  // Clear existing timeout if filter changes again
  if (filterTimeout) {
    clearTimeout(filterTimeout)
  }
  
  // Debounce API call to wait for final filter value
  filterTimeout = setTimeout(() => {
    loadReviews()
    filterTimeout = null
  }, 500) // 500ms delay before calling API
}

const handleFilterUpdate = (key: keyof typeof filters.value, value: string | number | undefined) => {
  if (key === 'minScore' || key === 'maxScore') {
    filters.value[key] = value as number | undefined
  } else {
    (filters.value as Record<string, string>)[key] = value as string
  }
  handleFilterChange()
}

const handlePageSizeChange = (value: string | number | undefined) => {
  pageSize.value = Number(value) || 20
  page.value = 1
  updateURL()
  loadReviews()
}

const handleSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    updateURL()
    loadReviews()
  }, 500)
}

const clearSearch = () => {
  filters.value.q = ''
  page.value = 1
  updateURL()
  loadReviews()
}

const clearFilter = (key: keyof typeof filters.value) => {
  // Clear any pending filter timeout
  if (filterTimeout) {
    clearTimeout(filterTimeout)
    filterTimeout = null
  }
  
  if (key === 'minScore' || key === 'maxScore') {
    filters.value[key] = undefined
    // Clear validation error when clearing score filters
    if (key === 'minScore' || key === 'maxScore') {
      scoreRangeError.value = null
    }
  } else {
    (filters.value as Record<string, string>)[key] = ''
  }
  page.value = 1
  updateURL()
  // Clear filter is an intentional action, call API immediately
  loadReviews()
}

const clearAllFilters = () => {
  // Clear any pending filter timeout
  if (filterTimeout) {
    clearTimeout(filterTimeout)
    filterTimeout = null
  }
  
  filters.value = {
    country: '', travelerType: '', source: '', sentiment: '',
    minScore: undefined, maxScore: undefined, q: '',
  }
  scoreRangeError.value = null // Clear validation errors
  page.value = 1
  
  // Clear session storage
  clearReviewsFilters()
  
  updateURL()
  // Clear all filters is an intentional action, call API immediately
  loadReviews()
}

const loadReviews = () => {
  // Validate filters before sending
  if (!validateFilters()) {
    return // Don't load if validation fails
  }
  
  const params: ReviewsQueryParams = { page: page.value, pageSize: pageSize.value, sort: sort.value }
  
  // Only add valid filters
  if (filters.value.country) params.country = filters.value.country
  if (filters.value.travelerType) params.travelerType = filters.value.travelerType
  if (filters.value.source) params.source = filters.value.source
  if (filters.value.sentiment) params.sentiment = filters.value.sentiment
  
  // Only add score filters if they're valid
  if (filters.value.minScore !== undefined && filters.value.minScore >= 1 && filters.value.minScore <= 5) {
    params.minScore = filters.value.minScore
  }
  if (filters.value.maxScore !== undefined && filters.value.maxScore >= 1 && filters.value.maxScore <= 5) {
    params.maxScore = filters.value.maxScore
  }
  
  // Only add maxScore if it's >= minScore (if both are set)
  if (params.minScore && params.maxScore && params.minScore > params.maxScore) {
    // Don't send invalid range - clear the error and don't send these params
    scoreRangeError.value = 'Invalid score range: min > max'
    delete params.minScore
    delete params.maxScore
    return
  }
  
  if (filters.value.q) params.q = filters.value.q
  
  fetchReviews(params).then(() => {
    // If API doesn't support the sort, do client-side sorting as fallback
    if (data.value && needsClientSideSort(sort.value)) {
      applyClientSideSort()
    }
  })
}

// Check if sort option needs client-side sorting (not supported by API)
const needsClientSideSort = (sortValue: string): boolean => {
  // API supports: createdAt_desc, createdAt_asc, score_desc, score_asc
  const apiSupportedSorts = ['createdAt_desc', 'createdAt_asc', 'score_desc', 'score_asc']
  return !apiSupportedSorts.includes(sortValue)
}

// Apply client-side sorting to current page results
const applyClientSideSort = () => {
  if (!data.value || !data.value.items) return
  
  const [field, direction] = sort.value.split('_')
  const isAsc = direction === 'asc'
  
  data.value.items.sort((a, b) => {
    let aVal: any = a[field as keyof typeof a]
    let bVal: any = b[field as keyof typeof b]
    
    // Handle string comparison
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }
    
    if (aVal < bVal) return isAsc ? -1 : 1
    if (aVal > bVal) return isAsc ? 1 : -1
    return 0
  })
}

const goToPage = (n: number) => {
  page.value = n
  updateURL()
  loadReviews()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToDetail = (id: string) => {
  router.push(`/reviews/${id}`)
}

// Handle sort from table header
const handleSort = (field: string) => {
  const [currentField, currentDirection] = sort.value.split('_')
  
  // If clicking the same field, toggle direction; otherwise, default to ascending
  if (currentField === field) {
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc'
    sort.value = `${field}_${newDirection}`
  } else {
    sort.value = `${field}_asc`
  }
  
  handleFilterChange()
}

// Watch view mode and update URL
watch(viewMode, () => {
  updateURL()
  localStorage.setItem('reviewsViewMode', viewMode.value)
})

// Watch pageSize and update URL
watch(pageSize, () => {
  page.value = 1
  updateURL()
  loadReviews()
})

// ─── Formatters / helpers ──────────────────────────────
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

const travelerIcon = (t: string) =>
  ({ Business: '💼', Couple: '💑', Family: '👨‍👩‍👧', Solo: '🎒', Friends: '👥' } as Record<string, string>)[t] ?? '👤'

const sentimentEmoji = (s: string) =>
  ({ Positive: '😊', Neutral: '😐', Negative: '😞' } as Record<string, string>)[s] ?? ''

const sentimentBorderColor = (s: string) =>
  s === 'Positive' ? 'border-emerald-400' : s === 'Neutral' ? 'border-gray-300' : 'border-rose-400'

const sentimentBgColor = (s: string) =>
  s === 'Positive' ? 'bg-emerald-400' : s === 'Neutral' ? 'bg-gray-300' : 'bg-rose-400'

const getSentimentStyle = (s: string) =>
  s === 'Positive' ? 'bg-emerald-50 text-emerald-700' :
  s === 'Neutral' ? 'bg-gray-100 text-gray-600' :
  'bg-rose-50 text-rose-700'

const getSourceStyle = (source: string) =>
  ({
    Booking: 'bg-blue-100 text-blue-700',
    Google: 'bg-red-100 text-red-700',
    Tripadvisor: 'bg-green-100 text-green-700',
    Agoda: 'bg-orange-100 text-orange-700',
    Expedia: 'bg-yellow-100 text-yellow-800',
  } as Record<string, string>)[source] ?? 'bg-gray-100 text-gray-700'

onMounted(() => {
  // Fetch available countries for filter dropdown
  fetchCountries('country', 365) // Get all countries from last year
  
  // Check if we loaded from session storage (no URL params)
  const hasURLParams = Object.keys(route.query).length > 0
  if (!hasURLParams && (storedPagination || storedFilters)) {
    // Update URL to reflect stored values
    updateURL()
  }
  
  // Load reviews with initial URL params or stored values
  loadReviews()
})

// Cleanup timeouts on unmount
onBeforeUnmount(() => {
  if (filterTimeout) {
    clearTimeout(filterTimeout)
    filterTimeout = null
  }
  if (searchTimeout) {
    clearTimeout(searchTimeout)
    searchTimeout = null
  }
})
</script>

<style scoped>
.filter-select {
  @apply w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white transition;
}

.chip {
  @apply inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100 cursor-pointer hover:bg-blue-100 transition select-none;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
