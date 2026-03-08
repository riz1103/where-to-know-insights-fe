<template>
  <div
    @click="$emit('click')"
    class="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg border-l-4 transition-all duration-200 cursor-pointer"
    :class="sentimentBorderColor"
  >
    <div class="p-6">
      <div class="flex items-start justify-between gap-6">
        <!-- Left: Hotel name + meta -->
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-lg mb-3">
            🏨 {{ review.hotelName }}
          </h3>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span class="text-sm text-gray-600">📍 {{ review.country }}</span>
            <span class="text-sm text-gray-600">{{ travelerIcon }} {{ review.travelerType }}</span>
            <span
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
              :class="sourceStyle"
            >{{ review.source }}</span>
          </div>
        </div>

        <!-- Right: Score + Sentiment + Date -->
        <div class="flex flex-col items-end gap-2 flex-shrink-0">
          <div class="flex items-center gap-2">
            <span class="text-2xl font-extrabold text-gray-900 leading-none">{{ review.score }}</span>
            <div class="flex">
              <span
                v-for="i in 5"
                :key="i"
                class="text-lg leading-none"
                :class="i <= Math.round(review.score) ? 'text-amber-400' : 'text-gray-200'"
              >★</span>
            </div>
          </div>
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
            :class="sentimentStyle"
          >
            {{ sentimentEmoji }} {{ review.sentiment }}
          </span>
          <span class="text-sm text-gray-500">{{ formattedDate }}</span>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-gray-100 flex justify-end">
        <span class="text-sm text-blue-500 font-medium group-hover:text-blue-700 transition-colors">
          View full review →
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Review } from '@/types/api'

interface Props {
  review: Review
}

const props = defineProps<Props>()

defineEmits<{
  click: []
}>()

const travelerIconMap: Record<string, string> = {
  Business: '💼',
  Couple: '💑',
  Family: '👨‍👩‍👧',
  Solo: '🎒',
  Friends: '👥',
}

const sentimentEmojiMap: Record<string, string> = {
  Positive: '😊',
  Neutral: '😐',
  Negative: '😞',
}

const sourceStyleMap: Record<string, string> = {
  Booking: 'bg-blue-100 text-blue-700',
  Google: 'bg-red-100 text-red-700',
  Tripadvisor: 'bg-green-100 text-green-700',
  Agoda: 'bg-orange-100 text-orange-700',
  Expedia: 'bg-yellow-100 text-yellow-800',
}

const sentimentStyleMap: Record<string, string> = {
  Positive: 'bg-emerald-50 text-emerald-700',
  Neutral: 'bg-gray-100 text-gray-600',
  Negative: 'bg-rose-50 text-rose-700',
}

const sentimentBorderColorMap: Record<string, string> = {
  Positive: 'border-emerald-400',
  Neutral: 'border-gray-300',
  Negative: 'border-rose-400',
}

const travelerIcon = computed(() => travelerIconMap[props.review.travelerType] || '👤')
const sentimentEmoji = computed(() => sentimentEmojiMap[props.review.sentiment] || '')
const sourceStyle = computed(() => sourceStyleMap[props.review.source] || 'bg-gray-100 text-gray-700')
const sentimentStyle = computed(() => sentimentStyleMap[props.review.sentiment] || 'bg-gray-100 text-gray-600')
const sentimentBorderColor = computed(() => sentimentBorderColorMap[props.review.sentiment] || 'border-gray-300')

const formattedDate = computed(() => {
  return new Date(props.review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
})
</script>
