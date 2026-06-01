<template>
  <div class="flex flex-col shrink-0 px-6 pt-6 gap-3">
    <div :class="`flex justify-between gap-4 ${description ? 'items-start' : 'items-center'}`">
      <div class="flex flex-col gap-0.5">
        <h1 class="text-2xl font-semibold text-text-primary leading-8">{{ title }}</h1>
        <p v-if="description" class="text-sm text-text-tertiary leading-5">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-3 shrink-0">
        <slot name="actions" />
      </div>
    </div>
    <div class="h-px bg-border" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title:        string
  description?: string
}>()
</script>
