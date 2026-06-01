<template>
  <div class="flex flex-col items-center gap-2 select-none w-[300px]">
    <Handle v-if="!isStart" type="target" :position="Position.Top" class="!bg-border-strong !w-2.5 !h-2.5 !border-2 !border-white" />

    <div
      :class="cn(
        'flex items-center justify-center w-14 h-14 rounded-full shadow-sm',
        isStart ? 'bg-[#12b76a]' : 'bg-[#f04438]',
      )"
    >
      <Play  v-if="isStart"  :size="20" class="text-white fill-white ml-1" />
      <Square v-else          :size="16" class="text-white fill-white" />
    </div>

    <span class="text-xs font-semibold text-text-secondary pointer-events-none text-center leading-tight whitespace-nowrap">
      {{ isStart ? 'Début de processus' : 'Fin de processus' }}
    </span>

    <Handle v-if="isStart" type="source" :position="Position.Bottom" class="!bg-border-strong !w-2.5 !h-2.5 !border-2 !border-white" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { Play, Square } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

const props = defineProps<{
  data: { variant: 'start' | 'end' }
}>()

const isStart = computed(() => props.data.variant === 'start')
</script>
