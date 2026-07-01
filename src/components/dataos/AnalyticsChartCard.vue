<template>
  <div class="flex flex-col bg-white rounded-xl border border-border p-5 gap-4">

    <!-- Tête : intitulé de la question + contrôles (type, export) -->
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <span class="inline-flex items-center h-9 px-3 rounded-md border border-border bg-white text-sm font-medium text-text-tertiary">
        {{ question.label }}
      </span>

      <div class="flex items-center gap-2 shrink-0">
        <!-- Sélecteur de type de graphe -->
        <div ref="typeRoot" class="relative">
          <button
            type="button"
            class="flex items-center gap-2 h-9 pl-3 pr-2.5 rounded-md border border-border bg-white text-sm font-semibold text-text-secondary hover:bg-surface transition-colors"
            @click="typeOpen = !typeOpen"
          >
            <component :is="currentType.icon" :size="16" class="text-text-quaternary" />
            {{ currentType.label }}
            <ChevronDown :size="16" class="text-text-quaternary" />
          </button>

          <div
            v-if="typeOpen"
            class="absolute right-0 top-[calc(100%+4px)] z-20 w-44 py-1 bg-white rounded-lg border border-border shadow-[var(--ds-shadow-lg)]"
          >
            <button
              v-for="opt in CHART_TYPES"
              :key="opt.value"
              type="button"
              class="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:bg-surface transition-colors"
              @click="selectType(opt.value)"
            >
              <component :is="opt.icon" :size="16" class="text-text-quaternary" />
              <span class="flex-1 text-left">{{ opt.label }}</span>
              <Check v-if="opt.value === type" :size="16" class="text-[#056033]" />
            </button>
          </div>
        </div>

        <!-- Export PNG -->
        <button
          type="button"
          class="flex items-center justify-center w-9 h-9 rounded-md border border-border bg-white text-text-quaternary hover:bg-surface transition-colors"
          aria-label="Télécharger le graphique"
          @click="exportPng"
        >
          <Download :size="16" />
        </button>
      </div>
    </div>

    <!-- Graphe -->
    <div class="h-[360px]">
      <AnalyticsChart ref="chartRef" :question="question" :type="type" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, type Component } from 'vue'
import { BarChart3, PieChart, LineChart, ChevronDown, Check, Download } from 'lucide-vue-next'
import AnalyticsChart from '~/components/dataos/charts/AnalyticsChart.vue'
import { useToastStore } from '~/stores/toast'
import type { AnalyticsQuestion, AnalyticsChartType } from '~/types/dataos'

const props = defineProps<{ question: AnalyticsQuestion }>()
const toast = useToastStore()

const CHART_TYPES: { value: AnalyticsChartType; label: string; icon: Component }[] = [
  { value: 'barre',      label: 'Barre',      icon: BarChart3 },
  { value: 'circulaire', label: 'Circulaire', icon: PieChart },
  { value: 'ligne',      label: 'Ligne',      icon: LineChart },
]

// Type par défaut porté par la question, surchargeable ici.
const type = ref<AnalyticsChartType>(props.question.defaultChart)
const currentType = computed(() => CHART_TYPES.find((t) => t.value === type.value)!)

const typeOpen = ref(false)
const typeRoot = ref<HTMLElement | null>(null)

function selectType(v: AnalyticsChartType) {
  type.value = v
  typeOpen.value = false
}

// Fermeture au clic extérieur.
function onDocClick(e: MouseEvent) {
  if (typeOpen.value && typeRoot.value && !typeRoot.value.contains(e.target as Node)) {
    typeOpen.value = false
  }
}
onMounted(() => document.addEventListener('mousedown', onDocClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocClick))

// ── Export PNG ──
const chartRef = ref<{ toImage: () => string | null } | null>(null)

function slug(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function exportPng() {
  const dataUrl = chartRef.value?.toImage()
  if (!dataUrl) return
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `${slug(props.question.label)}.png`
  a.click()
  toast.show({ title: 'Graphique téléchargé', description: `${props.question.label} — image PNG enregistrée.` })
}
</script>
