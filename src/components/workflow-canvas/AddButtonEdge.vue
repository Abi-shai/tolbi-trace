<template>
  <!-- Wide invisible stroke for easy hover detection -->
  <path
    :d="edgePath"
    fill="none"
    stroke-width="20"
    stroke="transparent"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  />
  <!-- Visible stroke -->
  <path
    :id="id"
    :d="edgePath"
    fill="none"
    stroke-width="1.5"
    stroke="#d0d5dd"
    :marker-end="markerEnd"
    class="vue-flow__edge-path"
  />

  <EdgeLabelRenderer>
    <div
      :style="{
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
        pointerEvents: 'all',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.12s',
      }"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
    >
      <button
        @click="builder.insertStep(source)"
        class="flex items-center justify-center w-5 h-5 rounded bg-white border border-border shadow-sm text-text-quaternary hover:border-primary hover:text-primary hover:bg-brand-50 transition-colors"
      >
        <Plus :size="11" />
      </button>
    </div>
  </EdgeLabelRenderer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { EdgeLabelRenderer, getSmoothStepPath, Position } from '@vue-flow/core'
import { Plus } from 'lucide-vue-next'
import { useWorkflowBuilderStore } from '~/stores/workflow-builder'

const props = defineProps<{
  id:             string
  sourceX:        number
  sourceY:        number
  targetX:        number
  targetY:        number
  sourcePosition: Position
  targetPosition: Position
  markerEnd?:     string
  source:         string
}>()

const builder = useWorkflowBuilderStore()
const hovered = ref(false)

const pathData = computed(() => getSmoothStepPath({
  sourceX:        props.sourceX,
  sourceY:        props.sourceY,
  sourcePosition: props.sourcePosition,
  targetX:        props.targetX,
  targetY:        props.targetY,
  targetPosition: props.targetPosition,
}))

const edgePath = computed(() => pathData.value[0])
const labelX   = computed(() => pathData.value[1])
const labelY   = computed(() => pathData.value[2])
</script>
