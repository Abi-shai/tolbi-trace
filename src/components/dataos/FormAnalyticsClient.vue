<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden bg-surface content-arrive">

    <Header title="Analytiques" />

    <div class="flex-1 overflow-y-auto">
      <div class="flex flex-col gap-6 p-6">

        <!-- Cartouches de synthèse (composant partagé MetricCard) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            v-for="c in cards"
            :key="c.label"
            :icon="c.icon"
            :label="c.label"
            :value="c.value"
          />
        </div>

        <!-- Sélecteur de questions à visualiser -->
        <div ref="qRoot" class="relative self-start">
          <button
            type="button"
            class="flex items-center gap-2 h-10 pl-3.5 pr-3 rounded-md border border-border bg-white text-sm font-semibold text-text-secondary hover:bg-surface transition-colors"
            @click="qOpen = !qOpen"
          >
            Questions
            <span class="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-[#e6f0eb] text-[#056033] text-xs font-semibold">
              {{ selected.length }}
            </span>
            <ChevronDown :size="16" class="text-text-quaternary" />
          </button>

          <div
            v-if="qOpen"
            class="absolute left-0 top-[calc(100%+4px)] z-20 w-[300px] p-1.5 bg-white rounded-lg border border-border shadow-[var(--ds-shadow-lg)]"
          >
            <label
              v-for="q in questions"
              :key="q.id"
              class="flex items-center justify-between gap-3 px-2.5 py-2 rounded-md hover:bg-surface cursor-pointer"
            >
              <span class="text-sm text-text-secondary">{{ q.label }}</span>
              <DsCheckbox
                :model-value="selected.includes(q.id)"
                size="sm"
                @update:model-value="toggle(q.id)"
              />
            </label>
          </div>
        </div>

        <!-- Une carte-graphique par question sélectionnée (ordre fixe du sélecteur) -->
        <div v-if="visibleQuestions.length" class="flex flex-col gap-6">
          <AnalyticsChartCard
            v-for="q in visibleQuestions"
            :key="q.id"
            :question="q"
          />
        </div>

        <!-- État vide -->
        <div
          v-else
          class="flex flex-col items-center justify-center gap-2 py-16 bg-white border border-dashed border-border rounded-xl text-center"
        >
          <BarChart3 :size="28" class="text-text-quaternary" />
          <p class="text-sm text-text-tertiary max-w-xs">
            Sélectionne au moins une question pour visualiser les données collectées.
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Users, Map, Layers, ChevronDown, BarChart3, type LucideIcon } from 'lucide-vue-next'
import Header from '~/components/layout/Header.vue'
import MetricCard from '~/components/ui/MetricCard.vue'
import AnalyticsChartCard from '~/components/dataos/AnalyticsChartCard.vue'
import { analyticsSummary, analyticsQuestions } from '~/data/dataos'

const questions = analyticsQuestions

const cards = computed<{ label: string; value: string; icon: LucideIcon }[]>(() => [
  { label: 'Producteurs',         value: analyticsSummary.producteurs.toLocaleString('fr-FR'), icon: Users },
  { label: 'Parcelles',           value: analyticsSummary.parcelles.toLocaleString('fr-FR'),   icon: Map },
  { label: 'Surface totale (ha)', value: analyticsSummary.surfaceHa.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }), icon: Layers },
])

// Défaut : première question sélectionnée (badge « 1 »), comme le Figma.
const selected = ref<string[]>([questions[0].id])

// Ordre fixe du sélecteur, indépendant de l'ordre de sélection.
const visibleQuestions = computed(() => questions.filter((q) => selected.value.includes(q.id)))

function toggle(id: string) {
  const i = selected.value.indexOf(id)
  if (i === -1) selected.value.push(id)
  else selected.value.splice(i, 1)
}

// Fermeture du sélecteur au clic extérieur.
const qOpen = ref(false)
const qRoot = ref<HTMLElement | null>(null)
function onDocClick(e: MouseEvent) {
  if (qOpen.value && qRoot.value && !qRoot.value.contains(e.target as Node)) qOpen.value = false
}
onMounted(() => document.addEventListener('mousedown', onDocClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocClick))
</script>
