<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
    <Header
      title="Traçabilité"
      description="Visualisez les relations entre QR codes, producteurs, étapes et agents."
    >
      <template #actions>
        <div class="relative">
          <DsButton
            label="Exporter"
            icon-leading="download-01"
            variant="primary"
            @click="showExport = !showExport"
          />
          <template v-if="showExport">
            <div class="fixed inset-0 z-10" @click="showExport = false" />
            <div class="absolute right-0 top-[calc(100%+4px)] bg-white border border-border rounded-lg shadow-lg overflow-hidden z-20 w-44">
              <button
                v-for="opt in EXPORT_OPTIONS"
                :key="opt.key"
                @click="handleExport(opt.key)"
                class="flex flex-col items-start w-full px-3 py-2.5 text-left hover:bg-surface transition-colors border-b border-border last:border-0"
              >
                <span class="text-xs font-semibold text-text-primary">{{ opt.label }}</span>
                <span class="text-[10px] text-text-quaternary">{{ opt.desc }}</span>
              </button>
            </div>
          </template>
        </div>
      </template>
    </Header>

    <div class="flex flex-1 min-h-0 overflow-hidden">

      <!-- Left panel -->
      <aside class="flex flex-col w-fit shrink-0 border-r border-border bg-white overflow-y-auto">

        <!-- Mode toggle -->
        <div class="px-3 py-3 border-b border-border">
          <div class="flex items-center gap-2">
            <button
              @click="switchToWorkflow"
              :class="cn(
                'flex-1 flex items-center justify-center gap-1.5 h-9 px-3 rounded-md text-sm font-semibold whitespace-nowrap transition-colors',
                mode === 'workflow' ? 'bg-white text-text-secondary shadow-sm' : 'text-text-quaternary hover:text-text-secondary',
              )"
            >
              <Network :size="14" />
              Processus
            </button>
            <button
              @click="switchToFocus"
              :class="cn(
                'flex-1 flex items-center justify-center gap-1.5 h-9 px-3 rounded-md text-sm font-semibold whitespace-nowrap transition-colors',
                mode === 'focus' ? 'bg-white text-text-secondary shadow-sm' : isBagSelected ? 'text-text-quaternary hover:text-text-secondary' : 'text-text-quaternary cursor-not-allowed',
              )"
            >
              <Package :size="14" />
              QR code
            </button>
          </div>
        </div>

        <!-- Legends (workflow mode) -->
        <template v-if="mode === 'workflow'">
          <div class="px-4 py-4 border-b border-border">
            <p class="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-3">Nœuds</p>
            <ul class="space-y-2">
              <li v-for="item in LEGEND_NODES" :key="item.type" class="flex items-center gap-2.5 text-xs text-text-secondary">
                <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: NODE_COLORS[item.type] }" />
                {{ item.label }}
              </li>
            </ul>
          </div>

          <div class="px-4 py-4 border-b border-border">
            <p class="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-3">Statut étapes</p>
            <ul class="space-y-2">
              <li v-for="item in STATUS_LEGEND" :key="item.label" class="flex items-center gap-2 text-xs text-text-secondary">
                <span class="w-2.5 h-2.5 rounded-[3px] border-2 shrink-0" :style="{ borderColor: item.color }" />
                {{ item.label }}
              </li>
            </ul>
          </div>

          <div class="px-4 py-4">
            <p class="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-3">Relations</p>
            <ul class="space-y-2">
              <li v-for="item in EDGE_LEGEND" :key="item.label" class="flex items-center gap-2.5">
                <svg width="18" height="8" class="shrink-0">
                  <line x1="0" y1="4" x2="18" y2="4" :stroke="item.color" stroke-width="1.5" :stroke-dasharray="item.dash ? '4 3' : undefined" />
                </svg>
                <span class="text-[11px] text-text-tertiary">{{ item.label }}</span>
              </li>
            </ul>
          </div>
        </template>

        <!-- Selected non-bag node -->
        <div v-if="selected && mode === 'workflow' && selected.type !== 'bag'" class="px-4 py-4 border-t border-border">
          <p class="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-3">Sélection</p>
          <div class="flex items-center justify-center w-9 h-9 rounded-full mb-2" :style="{ backgroundColor: NODE_COLORS[selected.type] }">
            <span class="text-white text-[10px] font-bold">{{ selected.label.replace(/\n/g, ' ')[0] }}</span>
          </div>
          <p class="text-sm font-semibold text-text-primary leading-tight">{{ selected.label.replace(/\n/g, ' ') }}</p>
          <p class="text-xs text-text-tertiary capitalize mt-0.5">{{ selected.type }}</p>
        </div>

        <!-- Bag detail (focus mode) -->
        <div v-if="mode === 'focus' && bagDetail" class="flex flex-col flex-1 overflow-y-auto border-t border-border">
          <div class="px-4 py-4 border-b border-border">
            <div class="flex items-center gap-2 mb-2">
              <span class="flex items-center justify-center w-7 h-7 rounded-full shrink-0 text-white text-[9px] font-bold" :style="{ backgroundColor: NODE_COLORS.bag }">S</span>
              <p class="text-sm font-mono font-semibold text-text-primary">{{ bagDetail.code }}</p>
            </div>
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-[11px] text-text-tertiary">Étape</span>
                <span class="text-[11px] font-semibold text-text-primary">{{ bagDetail.currentStep }} / 5</span>
              </div>
              <div v-if="bagDetail.producer" class="flex items-center justify-between gap-2">
                <span class="text-[11px] text-text-tertiary">Producteur</span>
                <span class="text-[11px] font-semibold text-text-primary truncate">{{ bagDetail.producer.label.replace(/\n/g, ' ') }}</span>
              </div>
            </div>
          </div>
          <div class="px-4 py-4">
            <p class="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-4">Historique</p>
            <ol class="relative flex flex-col gap-0">
              <li v-for="(event, i) in bagDetail.events" :key="event.id" class="relative pl-5 pb-4 last:pb-0">
                <div class="absolute left-0 top-[3px] w-2.5 h-2.5 rounded-full border-2 border-white ring-1" :style="{ backgroundColor: NODE_COLORS.step, boxShadow: `0 0 0 1px ${NODE_COLORS.step}` }" />
                <div v-if="i < bagDetail.events.length - 1" class="absolute left-[4px] top-[14px] bottom-0 w-px bg-border" />
                <p class="text-[11px] font-semibold text-text-primary leading-snug">{{ event.stepName }}</p>
                <p class="text-[10px] text-text-secondary mt-0.5">{{ event.agentName }}</p>
                <p class="text-[10px] text-text-quaternary">{{ event.timestamp }}</p>
              </li>
            </ol>
          <!-- Lien vers détail complet -->
          <div class="px-4 pb-4 shrink-0">
            <NuxtLink
              :to="`/workflows/${props.workflowId}/sacs/${bagDetail.qrId}`"
              class="flex items-center justify-center w-full gap-1.5 py-2 px-3 text-xs font-semibold text-primary border border-border rounded-lg hover:bg-surface transition-colors"
            >
              Voir le détail complet
            </NuxtLink>
          </div>
          </div>
        </div>
      </aside>

      <!-- Canvas -->
      <div class="relative flex-1 min-h-0">

        <!-- Focus mode pill -->
        <div v-if="mode === 'focus' && selected" class="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white border border-border rounded-full px-4 py-1.5 shadow-sm flex items-center gap-2">
          <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: NODE_COLORS.bag }" />
          <span class="text-xs text-text-secondary">
            Focus · <span class="font-mono font-semibold text-text-primary">{{ bagDetail?.code }}</span>
          </span>
          <button @click="handleNodeSelect(null)" class="text-xs text-text-quaternary hover:text-text-secondary transition-colors ml-1">✕</button>
        </div>

        <GraphLoader
          :nodes="nodes"
          :edges="edges"
          :mode="mode"
          :focus-bag-id="mode === 'focus' ? (selected?.id ?? null) : null"
          @node-select="handleNodeSelect"
          @export-ready="(fns) => { exportFns = fns }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Network, Package } from 'lucide-vue-next'
import Header from '~/components/layout/Header.vue'
import GraphLoader from './GraphLoader.vue'
import { cn } from '~/lib/utils'
import type { GraphNode, GraphEdge } from '~/data/graph'
import { NODE_COLORS, STATUS_BORDER } from './graph-constants'
import type { GraphExportFns } from './GraphView.vue'
import { getBagEvents } from '~/data/bag-events'

const props = defineProps<{
  nodes: GraphNode[]
  edges: GraphEdge[]
  workflowId: string
}>()

const LEGEND_NODES = [
  { type: 'step'        as const, label: 'Étape'      },
  { type: 'bag'         as const, label: 'QR code'    },
  { type: 'producer'    as const, label: 'Producteur' },
  { type: 'agent'       as const, label: 'Agent'      },
  { type: 'cooperative' as const, label: 'Coopérative'},
]

const STATUS_LEGEND = [
  { color: STATUS_BORDER.done,        label: 'Terminée'   },
  { color: STATUS_BORDER.in_progress, label: 'En cours'   },
  { color: STATUS_BORDER.pending,     label: 'En attente' },
  { color: STATUS_BORDER.blocked,     label: 'Bloquée'    },
]

const EDGE_LEGEND = [
  { color: '#056033', dash: false, label: 'Séquence processus'   },
  { color: '#ea580c', dash: true,  label: 'QR code → Étape'      },
  { color: '#93c5fd', dash: true,  label: 'QR code → Producteur' },
  { color: '#9ca3af', dash: true,  label: 'Agent → Étape'        },
  { color: '#c4b5fd', dash: true,  label: 'Producteur → Coop'    },
]

const EXPORT_OPTIONS = [
  { label: 'Image PNG',    desc: 'Haute résolution ×2', key: 'png' as const },
  { label: 'Image SVG',    desc: 'Vectoriel',            key: 'svg' as const },
  { label: 'Document PDF', desc: 'Via impression',       key: 'pdf' as const },
]

type ViewMode = 'workflow' | 'focus'

const showExport = ref(false)
const mode       = ref<ViewMode>('workflow')
const selected   = ref<GraphNode | null>(null)
const exportFns  = ref<GraphExportFns | null>(null)

const isBagSelected = computed(() => selected.value?.type === 'bag')

const bagDetail = computed(() => {
  if (!selected.value || selected.value.type !== 'bag') return null
  const qrId        = selected.value.id.replace('bag-', 'qr-')
  const scanEdge    = props.edges.find((e) => e.source === selected.value!.id && e.type === 'scanned_at')
  const currentStep = scanEdge ? parseInt(scanEdge.target.replace('step-', ''), 10) : 1
  const events      = getBagEvents(qrId, currentStep)
  const belongsEdge = props.edges.find((e) => e.source === selected.value!.id && e.type === 'belongs_to')
  const producer    = belongsEdge ? props.nodes.find((n) => n.id === belongsEdge.target) : null
  const code        = `KLK-2025-${qrId.replace('qr-', '')}`
  return { qrId, currentStep, events, producer, code }
})

function handleNodeSelect(node: GraphNode | null) {
  selected.value = node
  if (!node || node.type !== 'bag') mode.value = 'workflow'
  else mode.value = 'focus'
}

function switchToFocus() { if (isBagSelected.value) mode.value = 'focus' }
function switchToWorkflow() { mode.value = 'workflow' }

function handleExport(key: 'png' | 'svg' | 'pdf') {
  exportFns.value?.[key]()
  showExport.value = false
}
</script>
