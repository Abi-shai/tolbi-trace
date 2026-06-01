<template>
  <span
    :class="cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
      VARIANTS[variant],
      $attrs.class as string,
    )"
  >
    <span v-if="dot" :class="cn('w-1.5 h-1.5 rounded-full shrink-0', DOT_VARIANTS[variant])" />
    <slot />
  </span>
</template>

<script setup lang="ts">
import { cn } from '~/lib/utils'

type Variant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  variant?: Variant
  dot?:     boolean
}>(), {
  variant: 'default',
  dot:     false,
})

const VARIANTS: Record<Variant, string> = {
  default: 'bg-surface       text-text-secondary  border-border',
  success: 'bg-brand-50      text-primary         border-brand-50',
  warning: 'bg-warning-bg    text-warning-text    border-warning-border',
  error:   'bg-red-50        text-status-anomaly  border-red-200',
  info:    'bg-blue-50       text-blue-700        border-blue-200',
  neutral: 'bg-surface-alt   text-text-tertiary   border-border',
}

const DOT_VARIANTS: Record<Variant, string> = {
  default: 'bg-text-disabled',
  success: 'bg-primary',
  warning: 'bg-warning-text',
  error:   'bg-status-anomaly',
  info:    'bg-blue-500',
  neutral: 'bg-text-disabled',
}
</script>
