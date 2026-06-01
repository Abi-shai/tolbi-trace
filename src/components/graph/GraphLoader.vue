<template>
  <ClientOnly>
    <template #fallback>
      <div class="flex items-center justify-center flex-1 h-full text-sm text-text-tertiary bg-surface">
        Chargement du graphe…
      </div>
    </template>

    <GraphView
      :nodes="nodes"
      :edges="edges"
      :mode="mode"
      :focus-bag-id="focusBagId"
      @node-select="$emit('nodeSelect', $event)"
      @export-ready="$emit('exportReady', $event)"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import GraphView, { type GraphExportFns } from './GraphView.vue'
import type { GraphNode, GraphEdge } from '~/data/graph'

defineProps<{
  nodes:      GraphNode[]
  edges:      GraphEdge[]
  mode:       'workflow' | 'focus'
  focusBagId: string | null
}>()

defineEmits<{
  nodeSelect:  [node: GraphNode | null]
  exportReady: [fns: GraphExportFns]
}>()
</script>
