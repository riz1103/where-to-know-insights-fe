<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-100">
        <thead class="bg-gray-50">
          <tr>
            <TableHeader
              v-for="column in columns"
              :key="column.field"
              :field="column.field"
              :label="column.label"
              :currentSort="currentSort"
              @sort="handleSort"
            />
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-50">
          <ReviewTableRow
            v-for="review in reviews"
            :key="review.id"
            :review="review"
            @click="$emit('rowClick', review.id)"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Review } from '@/types/api'
import TableHeader from './TableHeader.vue'
import ReviewTableRow from './ReviewTableRow.vue'

interface Props {
  reviews: Review[]
  currentSort: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  rowClick: [id: string]
  sort: [field: string]
}>()

const columns = [
  { field: 'hotelName', label: 'Hotel' },
  { field: 'country', label: 'Country' },
  { field: 'travelerType', label: 'Traveler' },
  { field: 'source', label: 'Source' },
  { field: 'score', label: 'Score' },
  { field: 'sentiment', label: 'Sentiment' },
  { field: 'createdAt', label: 'Date' },
]

const handleSort = (field: string) => {
  emit('sort', field)
}
</script>
