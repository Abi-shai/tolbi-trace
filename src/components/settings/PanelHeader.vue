<template>
  <div class="flex items-start justify-between gap-4 border-b border-border pb-5">
    <div class="min-w-0">
      <h2 class="text-xl font-semibold text-text-primary">{{ title }}</h2>
      <p v-if="description" class="mt-1 text-base text-text-tertiary">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>
