<template>
  <th
    @click.stop="$emit('sort', field)"
    class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
  >
    <div class="flex items-center gap-1.5">
      <span>{{ label }}</span>
      <SortIcon :field="field" :currentSort="currentSort" />
    </div>
  </th>
</template>

<script setup lang="ts">
import SortIcon from '@/components/common/SortIcon.vue'

interface Props {
  field: string
  label: string
  currentSort: string
}

defineProps<Props>()

defineEmits<{
  sort: [field: string]
}>()
</script>
