<template>
  <div
    :class="cn(
      'flex items-center justify-center rounded-full shrink-0',
      'bg-surface-alt ring-[0.75px] ring-black/[0.08]',
      SIZES[size].wrapper,
      $attrs.class as string,
    )"
  >
    <span
      v-if="resolvedVariant === 'initials' && name"
      :class="cn('font-semibold text-text-tertiary leading-none', SIZES[size].text)"
    >
      {{ getInitials(name) }}
    </span>
    <User v-else :size="SIZES[size].icon" class="text-text-tertiary" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { User } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

type Size    = 'sm' | 'md' | 'lg'
type Variant = 'icon' | 'initials'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  name?:    string
  size?:    Size
  variant?: Variant
}>(), {
  size: 'md',
})

const SIZES: Record<Size, { wrapper: string; icon: number; text: string }> = {
  sm: { wrapper: 'w-7 h-7',   icon: 13, text: 'text-[10px]' },
  md: { wrapper: 'w-10 h-10', icon: 16, text: 'text-sm'     },
  lg: { wrapper: 'w-12 h-12', icon: 20, text: 'text-base'   },
}

const resolvedVariant = computed<Variant>(() =>
  props.variant ?? (props.name ? 'initials' : 'icon'),
)

function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}
</script>
