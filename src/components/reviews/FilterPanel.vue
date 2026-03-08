<template>
  <transition name="slide-fade">
    <div v-if="show" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Country</label>
          <SearchableSelect
            :model-value="filters.country"
            :options="countryOptions"
            placeholder="All countries"
            all-option-label="All countries"
            @update:modelValue="updateFilter('country', $event)"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Traveler</label>
          <SearchableSelect
            :model-value="filters.travelerType"
            :options="travelerOptions"
            placeholder="All types"
            all-option-label="All types"
            @update:modelValue="updateFilter('travelerType', $event)"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Source</label>
          <SearchableSelect
            :model-value="filters.source"
            :options="sourceOptions"
            placeholder="All sources"
            all-option-label="All sources"
            @update:modelValue="updateFilter('source', $event)"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Sentiment</label>
          <SearchableSelect
            :model-value="filters.sentiment"
            :options="sentimentOptions"
            placeholder="All"
            all-option-label="All"
            @update:modelValue="updateFilter('sentiment', $event)"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Score range</label>
          <div class="flex gap-2">
            <div class="flex-1">
              <input
                :value="filters.minScore ?? ''"
                @input="handleMinScoreInput"
                @keydown="preventInvalidScoreInput"
                @blur="validateScoreRange"
                type="number" min="1" max="5" step="1" placeholder="Min"
                class="filter-select w-full"
                :class="{ 'border-red-300 ring-red-200': scoreRangeError }"
              />
            </div>
            <div class="flex-1">
              <input
                :value="filters.maxScore ?? ''"
                @input="handleMaxScoreInput"
                @keydown="preventInvalidScoreInput"
                @blur="validateScoreRange"
                type="number" min="1" max="5" step="1" placeholder="Max"
                class="filter-select w-full"
                :class="{ 'border-red-300 ring-red-200': scoreRangeError }"
              />
            </div>
          </div>
          <p v-if="scoreRangeError" class="mt-1 text-xs text-red-600">{{ scoreRangeError }}</p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import SearchableSelect from '@/components/common/SearchableSelect.vue'

interface FilterValues {
  country: string
  travelerType: string
  source: string
  sentiment: string
  minScore?: number
  maxScore?: number
}

interface Props {
  show: boolean
  filters: FilterValues
  countryOptions: Array<{ value: string; label: string }>
  travelerOptions: Array<{ value: string; label: string }>
  sourceOptions: Array<{ value: string; label: string }>
  sentimentOptions: Array<{ value: string; label: string }>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:filter': [key: keyof FilterValues, value: string | number | undefined]
  'update:error': [error: string | null]
}>()

const scoreRangeError = ref<string | null>(null)

// Local state to track current values for validation
const localMinScore = ref<number | undefined>(props.filters.minScore)
const localMaxScore = ref<number | undefined>(props.filters.maxScore)

// Sync local state with props
watch(() => props.filters.minScore, (newVal) => {
  localMinScore.value = newVal
})
watch(() => props.filters.maxScore, (newVal) => {
  localMaxScore.value = newVal
})

const updateFilter = (key: keyof FilterValues, value: string | number | undefined) => {
  emit('update:filter', key, value)
}

const sanitizeScore = (value: string | number | undefined): number | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined
  }
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) {
    return undefined
  }
  // Clamp to valid range
  if (num < 1) return 1
  if (num > 5) return 5
  return Math.round(num) // Ensure integer
}

const handleMinScoreInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const rawValue = target.value
  
  // If empty, allow it (user might be clearing the field)
  if (rawValue === '') {
    localMinScore.value = undefined
    updateFilter('minScore', undefined)
    validateScoreRange()
    return
  }
  
  const sanitized = sanitizeScore(rawValue)
  
  if (sanitized === undefined) {
    // Reset to empty if invalid
    target.value = ''
    return
  }
  
  // Check against current max from props (source of truth)
  const currentMax = props.filters.maxScore
  
  // If max is set and new min > max, adjust max to match min
  if (currentMax !== undefined && sanitized > currentMax) {
    // Update both values - emit max first, then min
    localMaxScore.value = sanitized
    localMinScore.value = sanitized
    updateFilter('maxScore', sanitized)
    updateFilter('minScore', sanitized)
  } else {
    // Normal update
    localMinScore.value = sanitized
    updateFilter('minScore', sanitized)
  }
  
  // Trigger validation immediately
  validateScoreRange()
}

const handleMaxScoreInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const rawValue = target.value
  
  // If empty, allow it (user might be clearing the field)
  if (rawValue === '') {
    localMaxScore.value = undefined
    updateFilter('maxScore', undefined)
    validateScoreRange()
    return
  }
  
  const sanitized = sanitizeScore(rawValue)
  
  if (sanitized === undefined) {
    // Reset to empty if invalid
    target.value = ''
    return
  }
  
  // Check against current min from props (source of truth)
  const currentMin = props.filters.minScore
  
  // If min is set and new max < min, adjust min to match max
  if (currentMin !== undefined && sanitized < currentMin) {
    // Update both values - emit min first, then max
    localMinScore.value = sanitized
    localMaxScore.value = sanitized
    updateFilter('minScore', sanitized)
    updateFilter('maxScore', sanitized)
  } else {
    // Normal update
    localMaxScore.value = sanitized
    updateFilter('maxScore', sanitized)
  }
  
  // Trigger validation immediately
  validateScoreRange()
}

const preventInvalidScoreInput = (event: KeyboardEvent) => {
  const key = event.key
  const target = event.target as HTMLInputElement
  const currentValue = target.value
  const selectionStart = target.selectionStart || 0
  const selectionEnd = target.selectionEnd || 0
  const isMinField = target.placeholder === 'Min'
  
  // Allow: backspace, delete, tab, escape, enter, and arrow keys
  if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(key)) {
    return
  }
  
  // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
  if (event.ctrlKey || event.metaKey) {
    return
  }
  
  // Allow numbers 0-9 (we'll sanitize in the input handler)
  if (key >= '0' && key <= '9') {
    // Check if the resulting value would be invalid
    const textBefore = currentValue.substring(0, selectionStart)
    const textAfter = currentValue.substring(selectionEnd)
    const newValue = textBefore + key + textAfter
    const num = parseFloat(newValue)
    
    // If the number would be > 5, prevent it
    if (!isNaN(num) && num > 5) {
      event.preventDefault()
      return
    }
    
    // Prevent min > max combinations
    if (isMinField) {
      // If typing in min field, check against current max
      if (!isNaN(num) && props.filters.maxScore !== undefined && num > props.filters.maxScore) {
        // Allow it - we'll auto-adjust max in the input handler
        return
      }
    } else {
      // If typing in max field, check against current min
      if (!isNaN(num) && props.filters.minScore !== undefined && num < props.filters.minScore) {
        // Allow it - we'll auto-adjust min in the input handler
        return
      }
    }
    return
  }
  
  // Allow decimal point (though we'll round to integer)
  if (key === '.' || key === ',') {
    return
  }
  
  // Prevent all other keys (letters, special chars, etc.)
  event.preventDefault()
}

const validateScoreRange = () => {
  scoreRangeError.value = null
  
  // Use local state for validation to catch issues immediately
  const min = localMinScore.value ?? props.filters.minScore
  const max = localMaxScore.value ?? props.filters.maxScore
  
  if (min !== undefined && max !== undefined) {
    if (min < 1 || min > 5) {
      scoreRangeError.value = 'Min score must be between 1 and 5'
      emit('update:error', scoreRangeError.value)
      return false
    }
    if (max < 1 || max > 5) {
      scoreRangeError.value = 'Max score must be between 1 and 5'
      emit('update:error', scoreRangeError.value)
      return false
    }
    if (min > max) {
      scoreRangeError.value = 'Min score cannot be greater than max score'
      emit('update:error', scoreRangeError.value)
      return false
    }
  }
  
  if (min !== undefined && (min < 1 || min > 5)) {
    scoreRangeError.value = 'Min score must be between 1 and 5'
    emit('update:error', scoreRangeError.value)
    return false
  }
  if (max !== undefined && (max < 1 || max > 5)) {
    scoreRangeError.value = 'Max score must be between 1 and 5'
    emit('update:error', scoreRangeError.value)
    return false
  }
  
  emit('update:error', null)
  return true
}

// Watch filters to validate on change
watch(() => [props.filters.minScore, props.filters.maxScore], () => {
  validateScoreRange()
}, { deep: true })
</script>

<style scoped>
.filter-select {
  @apply w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white transition;
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
