<template>
  <div class="relative" ref="dropdownRef">
    <!-- Trigger Button -->
    <button
      @click="toggleDropdown"
      type="button"
      class="filter-select w-full flex items-center justify-between text-left"
      :class="{ 'ring-2 ring-blue-400': isOpen }"
    >
      <span class="truncate" :class="selectedLabel ? 'text-gray-700' : 'text-gray-400'">
        {{ selectedLabel || placeholder }}
      </span>
      <svg
        class="w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-200 max-h-80 overflow-hidden"
      >
        <!-- Search Input -->
        <div class="p-2 border-b border-gray-100 sticky top-0 bg-white">
          <div class="relative">
            <svg
              class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              @keydown.escape="closeDropdown"
              @keydown.enter.prevent="selectFirstResult"
              type="text"
              placeholder="Search..."
              class="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Options List -->
        <div class="overflow-y-auto max-h-64">
          <!-- "All" option -->
          <button
            v-if="showAllOption"
            @click="selectOption('')"
            type="button"
            class="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors flex items-center gap-2"
            :class="modelValue === '' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'"
          >
            <svg
              v-if="modelValue === ''"
              class="w-4 h-4 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            <span v-else class="w-4"></span>
            {{ allOptionLabel }}
          </button>

          <!-- Filtered Options -->
          <template v-if="filteredOptions.length > 0">
            <button
              v-for="option in filteredOptions"
              :key="option.value"
              @click="selectOption(option.value)"
              type="button"
              class="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors flex items-center gap-2"
              :class="modelValue === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'"
            >
              <svg
                v-if="modelValue === option.value"
                class="w-4 h-4 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <span v-else class="w-4"></span>
              <span v-html="highlightMatch(option.label)"></span>
            </button>
          </template>

          <!-- No Results -->
          <div v-else class="px-4 py-8 text-center text-sm text-gray-400">
            <svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            No results found
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface Option {
  value: string | number
  label: string
}

interface Props {
  modelValue: string | number | undefined
  options: Option[]
  placeholder?: string
  allOptionLabel?: string
  showAllOption?: boolean
}

const emit = defineEmits<{
  'update:modelValue': [value: string | number | undefined]
}>()

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select...',
  allOptionLabel: 'All',
  showAllOption: true,
})

const isOpen = ref(false)
const searchQuery = ref('')
const dropdownRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

const selectedLabel = computed(() => {
  if (props.modelValue === '' || props.modelValue === undefined || props.modelValue === null) {
    return null
  }
  const option = props.options.find(opt => String(opt.value) === String(props.modelValue))
  return option ? option.label : String(props.modelValue)
})

const filteredOptions = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.options
  }
  const query = searchQuery.value.toLowerCase().trim()
  return props.options.filter(opt =>
    opt.label.toLowerCase().includes(query)
  )
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    // Focus search input after dropdown opens
    setTimeout(() => {
      searchInputRef.value?.focus()
    }, 100)
  }
}

const closeDropdown = () => {
  isOpen.value = false
  searchQuery.value = ''
}

const selectOption = (value: string | number | undefined) => {
  emit('update:modelValue', value)
  closeDropdown()
}

const selectFirstResult = () => {
  if (filteredOptions.value.length > 0) {
    selectOption(filteredOptions.value[0].value)
  }
}

const highlightMatch = (text: string) => {
  if (!searchQuery.value.trim()) return text
  const query = searchQuery.value.trim()
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 font-semibold">$1</mark>')
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

// Watch for outside clicks
watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
