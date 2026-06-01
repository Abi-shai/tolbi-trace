<template>
  <div class="bg-white border border-border rounded-lg px-4 py-3 flex items-center gap-3 flex-1 min-w-0">
    <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-surface shrink-0">
      <component :is="icon" :size="16" class="text-text-tertiary" />
    </div>
    <div class="flex flex-col min-w-0">
      <p class="text-xs text-text-tertiary truncate">{{ label }}</p>
      <p class="text-2xl font-bold text-text-primary leading-8">{{ value }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LucideIcon } from 'lucide-vue-next'

defineProps<{
  icon:  LucideIcon
  label: string
  value: string | number
}>()
</script>
