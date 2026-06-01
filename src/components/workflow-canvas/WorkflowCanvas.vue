<template>
  <div class="flex-1 min-h-0">
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="displayEdges"
      :node-types="nodeTypes"
      :edge-types="edgeTypes"
      :nodes-draggable="true"
      :node-drag-threshold="2"
      :fit-view-on-init="true"
      :fit-view-options="{ padding: 0.18 }"
      :min-zoom="0.25"
      :max-zoom="2"
      :elements-selectable="false"
      :selection-on-drag="false"
      class="bg-surface"
      @node-click="handleNodeClick"
      @pane-click="handlePaneClick"
      @node-drag-start="handleNodeDragStart"
      @node-drag="handleNodeDrag"
      @node-drag-stop="handleNodeDragStop"
    >
      <Background :variant="BackgroundVariant.Dots" :gap="20" :size="1" color="#d0d5dd" />
      <Controls
        class="!shadow-none !border !border-border !rounded-lg overflow-hidden"
        :show-interactive="false"
      />
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { VueFlow, MarkerType, type Node, type Edge } from '@vue-flow/core'
import { Background, BackgroundVariant } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/controls/dist/style.css'
import StepNode       from './StepNode.vue'
import GhostNode      from './GhostNode.vue'
import TerminatorNode from './TerminatorNode.vue'
import AddButtonEdge  from './AddButtonEdge.vue'
import { useWorkflowBuilderStore } from '~/stores/workflow-builder'
import type { WorkflowStep } from '~/types/workflow-step'

// ─── Layout constants ─────────────────────────────────────────────────────────

const NODE_HEIGHT        = 160
const V_GAP              = 56
const TERMINATOR_HEIGHT  = 84
const GHOST_BUSY_HEIGHT  = 56
const GHOST_EMPTY_HEIGHT = 150

const GHOST_ID = '__ghost__'
const START_ID = '__start__'
const END_ID   = '__end__'

const NON_STEP_IDS = new Set([GHOST_ID, START_ID, END_ID])

const nodeTypes = { step: StepNode, ghost: GhostNode, terminator: TerminatorNode }
const edgeTypes = { addButton: AddButtonEdge }

// ─── Props ────────────────────────────────────────────────────────────────────

const props = defineProps<{ steps: WorkflowStep[] }>()

// ─── Store ────────────────────────────────────────────────────────────────────

const builder = useWorkflowBuilderStore()

// ─── Node builders ────────────────────────────────────────────────────────────

function stepsToNodes(steps: WorkflowStep[], selectedId: string | null): Node[] {
  return [...steps]
    .sort((a, b) => a.order - b.order)
    .map((step, i) => ({
      id:         step.id,
      type:       'step' as const,
      position:   { x: 0, y: i * (NODE_HEIGHT + V_GAP) },
      data:       { ...step, isSelected: step.id === selectedId },
      dragHandle: '.drag-handle',
    }))
}

function makeStartNode(): Node {
  return {
    id: START_ID, type: 'terminator',
    position:  { x: 0, y: -(TERMINATOR_HEIGHT + V_GAP) },
    data:      { variant: 'start' },
    draggable: false, selectable: false,
  }
}

function makeGhostNode(steps: WorkflowStep[]): Node {
  return {
    id: GHOST_ID, type: 'ghost',
    position:  { x: 0, y: steps.length * (NODE_HEIGHT + V_GAP) },
    data:      { isEmpty: steps.length === 0 },
    draggable: false, selectable: false,
  }
}

function makeEndNode(steps: WorkflowStep[]): Node {
  const ghostH = steps.length === 0 ? GHOST_EMPTY_HEIGHT : GHOST_BUSY_HEIGHT
  return {
    id: END_ID, type: 'terminator',
    position:  { x: 0, y: steps.length * (NODE_HEIGHT + V_GAP) + ghostH + V_GAP },
    data:      { variant: 'end' },
    draggable: false, selectable: false,
  }
}

// ─── Edge builders ────────────────────────────────────────────────────────────

const EDGE_STYLE  = { stroke: '#d0d5dd', strokeWidth: 1.5 }
const EDGE_DASHED = { stroke: '#d0d5dd', strokeWidth: 1.5, strokeDasharray: '5 4' }
const MARKER_END  = { type: MarkerType.ArrowClosed, color: '#d0d5dd', width: 16, height: 16 }

function buildStepEdges(steps: WorkflowStep[]): Edge[] {
  const sorted = [...steps].sort((a, b) => a.order - b.order)
  return sorted.slice(0, -1).map((step, i) => ({
    id: `e-${step.id}-${sorted[i + 1].id}`,
    source: step.id, target: sorted[i + 1].id,
    type: 'addButton', style: EDGE_STYLE, markerEnd: MARKER_END,
  }))
}

function buildStartEdge(steps: WorkflowStep[]): Edge {
  const sorted = [...steps].sort((a, b) => a.order - b.order)
  const target = sorted.length > 0 ? sorted[0].id : GHOST_ID
  return {
    id: `e-${START_ID}-${target}`,
    source: START_ID, target,
    type: 'smoothstep', style: EDGE_STYLE, markerEnd: MARKER_END,
  }
}

function buildGhostEdge(steps: WorkflowStep[]): Edge | null {
  if (steps.length === 0) return null
  const sorted = [...steps].sort((a, b) => a.order - b.order)
  const lastId = sorted[sorted.length - 1].id
  return {
    id: `e-${lastId}-${GHOST_ID}`,
    source: lastId, target: GHOST_ID,
    type: 'smoothstep', style: EDGE_DASHED,
  }
}

function buildEndEdge(): Edge {
  return {
    id: `e-${GHOST_ID}-${END_ID}`,
    source: GHOST_ID, target: END_ID,
    type: 'smoothstep', style: EDGE_DASHED,
  }
}

function buildAllEdges(steps: WorkflowStep[]): Edge[] {
  const ge = buildGhostEdge(steps)
  return [buildStartEdge(steps), ...buildStepEdges(steps), ...(ge ? [ge] : []), buildEndEdge()]
}

// ─── State ────────────────────────────────────────────────────────────────────

const nodes        = ref<Node[]>([])
const edges        = ref<Edge[]>([])
const isDragging   = ref(false)
const dragOrderRef = ref<string[]>([])
const storeReady   = ref(false)
const mountDone    = ref(false)

const displayEdges = computed({
  get: () => isDragging.value ? [] : edges.value,
  set: (val) => { edges.value = val },
})

// ─── Init ─────────────────────────────────────────────────────────────────────

onMounted(() => {
  if (!mountDone.value) {
    mountDone.value = true
    builder.initSteps(props.steps)
  }
})

// Sync store → canvas (skip during drag)
watch(
  [() => builder.steps, () => builder.selectedStepId],
  ([storeSteps, selectedId]) => {
    if (storeSteps.length > 0) storeReady.value = true
    if (!storeReady.value || isDragging.value) return

    nodes.value = [makeStartNode(), ...stepsToNodes(storeSteps, selectedId), makeGhostNode(storeSteps), makeEndNode(storeSteps)]
    edges.value = buildAllEdges(storeSteps)
  },
  { deep: true },
)

// ─── Drag handlers ────────────────────────────────────────────────────────────

function handleNodeClick({ node }: { node: Node }) {
  if (!NON_STEP_IDS.has(node.id)) builder.selectStep(node.id)
}

function handlePaneClick() {
  builder.selectStep(null)
}

function handleNodeDragStart() {
  isDragging.value = true
  dragOrderRef.value = []
}

function handleNodeDrag({ node }: { node: Node }) {
  const dragY    = node.position.y
  const stepNds  = nodes.value.filter((n) => !NON_STEP_IDS.has(n.id))

  const sorted = [...stepNds].sort((a, b) => {
    const ay = a.id === node.id ? dragY : a.position.y
    const by = b.id === node.id ? dragY : b.position.y
    return ay - by
  })

  dragOrderRef.value = sorted.map((n) => n.id)

  nodes.value = nodes.value.map((n) => {
    if (NON_STEP_IDS.has(n.id) || n.id === node.id) return n
    const newIdx = sorted.findIndex((s) => s.id === n.id)
    if (newIdx === -1) return n
    return { ...n, position: { x: 0, y: newIdx * (NODE_HEIGHT + V_GAP) } }
  })
}

function handleNodeDragStop() {
  isDragging.value = false

  const orderedIds = dragOrderRef.value
  if (orderedIds.length === 0) return

  builder.reorderSteps(orderedIds)

  nodes.value = nodes.value.map((n) => {
    if (NON_STEP_IDS.has(n.id)) return n
    const idx = orderedIds.indexOf(n.id)
    if (idx === -1) return n
    return { ...n, position: { x: 0, y: idx * (NODE_HEIGHT + V_GAP) } }
  })
}
</script>
