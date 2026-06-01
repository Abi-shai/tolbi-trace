<template>
  <button
    v-bind="$attrs"
    :class="cn(
      'inline-flex items-center justify-center rounded-lg font-semibold transition-colors',
      'disabled:opacity-40 disabled:cursor-not-allowed',
      VARIANTS[variant],
      SIZES[size],
      fullWidth && 'w-full',
      $attrs.class as string,
    )"
  >
    <component :is="icon" v-if="icon" :size="ICON_SIZE[size]" class="shrink-0" />
    <span v-if="$slots.default" class="px-[2px]"><slot /></span>
    <component :is="iconRight" v-if="iconRight" :size="ICON_SIZE[size]" class="shrink-0" />
  </button>
</template>

<script setup lang="ts">
import { cn } from '~/lib/utils'
import type { LucideIcon } from 'lucide-vue-next'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  variant?:   Variant
  size?:      Size
  icon?:      LucideIcon
  iconRight?: LucideIcon
  fullWidth?: boolean
}>(), {
  variant:  'primary',
  size:     'md',
  fullWidth: false,
})

const VARIANTS: Record<Variant, string> = {
  primary:   'bg-primary text-white hover:bg-primary-hover shadow-xs',
  secondary: 'bg-white border border-border-strong text-text-secondary hover:bg-surface shadow-xs',
  ghost:     'text-text-secondary hover:bg-surface',
  danger:    'bg-status-anomaly text-white hover:opacity-90 shadow-xs',
}

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-2    text-sm gap-1',
  md: 'px-3.5 py-2.5 text-sm gap-1',
}

const ICON_SIZE: Record<Size, number> = { sm: 16, md: 16 }
</script>
