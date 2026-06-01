<template>
  <div :class="cn('flex items-center gap-3', $attrs.class as string)">
    <div :class="cn('flex-1 bg-surface-alt rounded-full overflow-hidden', SIZES[size])">
      <div
        :class="cn('h-full rounded-full transition-all', FILL_VARIANTS[variant])"
        :style="{ width: `${clamped}%` }"
      />
    </div>
    <span v-if="showLabel" class="text-sm font-medium text-text-secondary tabular-nums w-9 shrink-0 text-right">
      {{ clamped }}%
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '~/lib/utils'

type Size    = 'sm' | 'md'
type Variant = 'brand' | 'success' | 'warning' | 'error'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  value:      number
  size?:      Size
  variant?:   Variant
  showLabel?: boolean
}>(), {
  size:      'md',
  variant:   'brand',
  showLabel: false,
})

const clamped = computed(() => Math.min(100, Math.max(0, props.value)))

const SIZES: Record<Size, string> = {
  sm: 'h-1.5',
  md: 'h-2',
}

const FILL_VARIANTS: Record<Variant, string> = {
  brand:   'bg-primary',
  success: 'bg-status-completed',
  warning: 'bg-status-inprogress',
  error:   'bg-status-anomaly',
}
</script>
