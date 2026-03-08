<template>
  <div class="min-h-full bg-gradient-to-br from-slate-50 via-white to-blue-50">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Back Button -->
      <button
        @click="goBack"
        class="group mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium"
      >
        <svg class="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Reviews
      </button>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-2xl shadow-sm p-8 animate-pulse">
        <div class="flex justify-between mb-6">
          <div class="flex-1 pr-8">
            <div class="h-6 bg-gray-200 rounded-lg w-3/4 mb-3"></div>
            <div class="h-4 bg-gray-100 rounded w-1/2"></div>
          </div>
          <div class="w-20 h-10 bg-gray-200 rounded-xl"></div>
        </div>
        <div class="space-y-2 mb-6">
          <div class="h-3 bg-gray-100 rounded w-full"></div>
          <div class="h-3 bg-gray-100 rounded w-full"></div>
          <div class="h-3 bg-gray-100 rounded w-4/5"></div>
          <div class="h-3 bg-gray-100 rounded w-3/4"></div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="i in 4" :key="i" class="h-16 bg-gray-50 rounded-xl"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
        <div class="text-5xl mb-3">⚠️</div>
        <h3 class="font-semibold text-red-800 mb-1">Failed to load review</h3>
        <p class="text-red-500 text-sm mb-5">{{ error }}</p>
        <button @click="goBack" class="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition">
          Go back
        </button>
      </div>

      <!-- Review Detail -->
      <div v-else-if="data" class="space-y-5">

        <!-- Hero Card -->
        <div
          class="bg-white rounded-2xl shadow-sm border-l-4 overflow-hidden"
          :class="sentimentBorderColor(data.sentiment)"
        >
          <div class="p-6">
            <!-- Title row -->
            <div class="flex items-start justify-between gap-4 mb-5">
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Hotel</p>
                <h1 class="text-xl font-bold text-gray-900">🏨 {{ data.hotelName }}</h1>
                <h2 v-if="data.title" class="mt-1 text-base text-gray-600 italic">"{{ data.title }}"</h2>
              </div>
              <!-- Score Badge -->
              <div class="flex flex-col items-center bg-gray-50 rounded-2xl px-4 py-3 flex-shrink-0">
                <span class="text-3xl font-extrabold text-gray-900 leading-none">{{ data.score }}</span>
                <div class="flex mt-1">
                  <span
                    v-for="i in 5"
                    :key="i"
                    class="text-base"
                    :class="i <= Math.round(data.score) ? 'text-amber-400' : 'text-gray-200'"
                  >★</span>
                </div>
                <span class="text-xs text-gray-400 mt-1">/ 5.0</span>
              </div>
            </div>

            <!-- Sentiment + Date -->
            <div class="flex items-center gap-3 flex-wrap">
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
                :class="getSentimentStyle(data.sentiment)"
              >
                {{ sentimentEmoji(data.sentiment) }} {{ data.sentiment }} Sentiment
              </span>
              <span class="text-sm text-gray-400">{{ formatDate(data.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Review Content -->
        <div v-if="data.content" class="bg-white rounded-2xl shadow-sm p-6">
          <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Review</h3>
          <p class="text-gray-700 leading-relaxed text-base">{{ data.content }}</p>
        </div>

        <!-- Meta Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-2xl shadow-sm p-4 text-center">
            <div class="text-2xl mb-1">📍</div>
            <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Country</p>
            <p class="mt-1 text-sm font-semibold text-gray-800">{{ data.country }}</p>
          </div>
          <div class="bg-white rounded-2xl shadow-sm p-4 text-center">
            <div class="text-2xl mb-1">{{ travelerIcon(data.travelerType) }}</div>
            <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Traveler</p>
            <p class="mt-1 text-sm font-semibold text-gray-800">{{ data.travelerType }}</p>
          </div>
          <div class="bg-white rounded-2xl shadow-sm p-4 text-center">
            <div class="text-2xl mb-1">📱</div>
            <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Source</p>
            <span
              class="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
              :class="getSourceStyle(data.source)"
            >{{ data.source }}</span>
          </div>
          <div class="bg-white rounded-2xl shadow-sm p-4 text-center">
            <div class="text-2xl mb-1">📅</div>
            <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Date</p>
            <p class="mt-1 text-sm font-semibold text-gray-800">{{ formatDate(data.createdAt) }}</p>
          </div>
        </div>

        <!-- Topics -->
        <div v-if="data.topics && data.topics.length > 0" class="bg-white rounded-2xl shadow-sm p-6">
          <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Topics Mentioned</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="topic in data.topics"
              :key="topic"
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100"
            >
              # {{ topic }}
            </span>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReview } from '@/composables/useApi'

const route = useRoute()
const router = useRouter()
const { loading, error, data, fetchReview } = useReview()

const goBack = () => router.push('/reviews')

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

const travelerIcon = (t: string) =>
  ({ Business: '💼', Couple: '💑', Family: '👨‍👩‍👧', Solo: '🎒', Friends: '👥' } as Record<string, string>)[t] ?? '👤'

const sentimentEmoji = (s: string) =>
  ({ Positive: '😊', Neutral: '😐', Negative: '😞' } as Record<string, string>)[s] ?? ''

const sentimentBorderColor = (s: string) =>
  s === 'Positive' ? 'border-emerald-400' : s === 'Neutral' ? 'border-gray-300' : 'border-rose-400'

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
  const id = route.params.id as string
  fetchReview(id)
})
</script>
