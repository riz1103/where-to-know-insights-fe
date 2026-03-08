<template>
  <tr
    @click="$emit('click')"
    class="group hover:bg-blue-50/50 cursor-pointer transition-colors"
  >
    <td class="px-4 py-3 whitespace-nowrap">
      <div class="flex items-center gap-2">
        <div
          class="w-1 h-8 rounded-full transition-all"
          :class="sentimentBgColor"
        ></div>
        <span class="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {{ review.hotelName }}
        </span>
      </div>
    </td>
    <td class="px-4 py-3 whitespace-nowrap">
      <span class="text-sm text-gray-600">📍 {{ review.country }}</span>
    </td>
    <td class="px-4 py-3 whitespace-nowrap">
      <span class="text-sm text-gray-600">{{ travelerIcon }} {{ review.travelerType }}</span>
    </td>
    <td class="px-4 py-3 whitespace-nowrap">
      <span
        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
        :class="sourceStyle"
      >{{ review.source }}</span>
    </td>
    <td class="px-4 py-3 whitespace-nowrap">
      <div class="flex items-center gap-1.5">
        <span class="text-sm font-bold text-gray-900">{{ review.score }}</span>
        <div class="flex">
          <span
            v-for="i in 5"
            :key="i"
            class="text-xs leading-none"
            :class="i <= Math.round(review.score) ? 'text-amber-400' : 'text-gray-200'"
          >★</span>
        </div>
      </div>
    </td>
    <td class="px-4 py-3 whitespace-nowrap">
      <span
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
        :class="sentimentStyle"
      >
        {{ sentimentEmoji }} {{ review.sentiment }}
      </span>
    </td>
    <td class="px-4 py-3 whitespace-nowrap">
      <span class="text-sm text-gray-500">{{ formattedDate }}</span>
    </td>
  </tr>
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

const sentimentBgColorMap: Record<string, string> = {
  Positive: 'bg-emerald-400',
  Neutral: 'bg-gray-300',
  Negative: 'bg-rose-400',
}

const travelerIcon = computed(() => travelerIconMap[props.review.travelerType] || '👤')
const sentimentEmoji = computed(() => sentimentEmojiMap[props.review.sentiment] || '')
const sourceStyle = computed(() => sourceStyleMap[props.review.source] || 'bg-gray-100 text-gray-700')
const sentimentStyle = computed(() => sentimentStyleMap[props.review.sentiment] || 'bg-gray-100 text-gray-600')
const sentimentBgColor = computed(() => sentimentBgColorMap[props.review.sentiment] || 'bg-gray-300')

const formattedDate = computed(() => {
  return new Date(props.review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
})
</script>
