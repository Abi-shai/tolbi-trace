<template>
  <div
    :class="cn(
      'step-node-card bg-white rounded-xl border transition-all w-[300px] cursor-pointer',
      data.isSelected
        ? 'border-primary ring-2 ring-primary/20 shadow-[0px_4px_12px_rgba(5,96,51,0.15)]'
        : 'border-border shadow-[0px_1px_3px_rgba(16,24,40,0.08)] hover:border-border-strong hover:shadow-[0px_2px_8px_rgba(16,24,40,0.10)]',
    )"
  >
    <Handle type="target" :position="Position.Top" class="!bg-border-strong !w-2.5 !h-2.5 !border-2 !border-white" />

    <!-- Drag handle -->
    <div class="drag-handle flex items-center justify-center py-2 border-b border-border cursor-grab active:cursor-grabbing hover:bg-surface transition-colors">
      <GripHorizontal :size="14" class="text-text-muted" />
    </div>

    <div class="nodrag p-4">
      <div class="flex items-start gap-3 mb-3">
        <span :class="cn(
          'flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5 transition-colors',
          data.isSelected ? 'bg-primary text-white' : 'bg-brand-50 text-primary',
        )">
          {{ data.order }}
        </span>
        <h3 class="text-sm font-semibold text-text-primary leading-5">{{ data.name }}</h3>
      </div>

      <div v-if="agentName" class="flex items-start gap-2 mb-3">
        <User :size="12" class="text-text-muted shrink-0 mt-0.5" />
        <div class="min-w-0">
          <p class="text-xs text-text-secondary leading-4 font-medium truncate">{{ agentName }}</p>
        </div>
      </div>

      <div v-if="uniqueTypes.length > 0" class="flex flex-wrap gap-1">
        <span
          v-for="type in uniqueTypes"
          :key="type"
          class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface text-text-tertiary border border-border"
        >
          {{ QUESTION_TYPE_LABELS[type] ?? type }}
        </span>
      </div>
    </div>

    <Handle type="source" :position="Position.Bottom" class="!bg-border-strong !w-2.5 !h-2.5 !border-2 !border-white" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { User, GripHorizontal } from 'lucide-vue-next'
import { QUESTION_TYPE_LABELS } from '~/types/workflow-step'
import { useAgentsStore } from '~/stores/agents'
import { cn } from '~/lib/utils'
import type { Question } from '~/types/workflow-step'

const props = defineProps<{
  data: {
    order:      number
    name:       string
    agentRole:  string
    agentId?:   string
    questions:  Question[]
    isSelected: boolean
  }
}>()

const agentsStore = useAgentsStore()
const agentName   = computed(() =>
  props.data.agentId
    ? (agentsStore.agents.find((a) => a.id === props.data.agentId)?.name ?? props.data.agentRole)
    : props.data.agentRole,
)
const uniqueTypes = computed(() => [...new Set(props.data.questions.map((q) => q.type))])
</script>
