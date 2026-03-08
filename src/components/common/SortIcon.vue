<template>
  <div class="inline-flex flex-col items-center">
    <svg
      class="w-3 h-3 transition-colors"
      :class="isAscending ? 'text-blue-600' : 'text-gray-300'"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
    </svg>
    <svg
      class="w-3 h-3 -mt-1 transition-colors"
      :class="isDescending ? 'text-blue-600' : 'text-gray-300'"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  field: string
  currentSort: string
}

const props = defineProps<Props>()

const isAscending = computed(() => {
  const [field, direction] = props.currentSort.split('_')
  return field === props.field && direction === 'asc'
})

const isDescending = computed(() => {
  const [field, direction] = props.currentSort.split('_')
  return field === props.field && direction === 'desc'
})
</script>
