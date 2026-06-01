<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label v-if="label" :for="inputId" class="text-sm font-semibold text-text-secondary">
      {{ label }}
    </label>

    <div class="relative">
      <component
        :is="leadingIcon"
        v-if="leadingIcon"
        :size="16"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
      />
      <input
        v-bind="$attrs"
        :id="inputId"
        :class="cn(
          'w-full py-2.5 text-sm bg-white border rounded-lg transition-colors',
          'placeholder:text-text-placeholder',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'shadow-xs',
          error
            ? 'border-status-anomaly focus:ring-status-anomaly/20 focus:border-status-anomaly'
            : 'border-border-strong',
          leadingIcon ? 'pl-9 pr-3.5' : 'px-3.5',
        )"
      />
    </div>

    <p v-if="error" class="text-xs text-status-anomaly leading-[18px]">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-text-muted leading-[18px]">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '~/lib/utils'
import type { LucideIcon } from 'lucide-vue-next'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  label?:       string
  leadingIcon?: LucideIcon
  error?:       string
  hint?:        string
  id?:          string
}>()

const inputId = computed(() =>
  props.id ?? props.label?.toLowerCase().replace(/\s+/g, '-'),
)
</script>
