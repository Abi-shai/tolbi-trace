<template>
  <div class="bg-white border border-border rounded-xl overflow-hidden">
    <div class="px-4 py-3 border-b border-border flex items-center gap-2">
      <span class="text-sm font-semibold text-text-primary flex-1">Résumé global</span>
      <span class="text-xs text-text-quaternary">{{ lastRefreshed }}</span>
      <button
        @click="handleRefresh"
        title="Actualiser"
        class="flex items-center justify-center w-6 h-6 rounded-md text-text-quaternary hover:text-text-secondary hover:bg-surface transition-colors"
      >
        <RefreshCw :size="12" :class="spinning && 'animate-spin'" />
      </button>
    </div>

    <div class="px-4 py-4 border-b border-border space-y-3">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <p class="text-2xl font-bold tabular-nums text-text-primary leading-tight">{{ activeWorkflows.length }}</p>
          <p class="text-xs text-text-quaternary mt-0.5">processus actif{{ activeWorkflows.length > 1 ? 's' : '' }}</p>
        </div>
        <div>
          <p class="text-2xl font-bold tabular-nums text-primary leading-tight">{{ avgCompletion }}%</p>
          <p class="text-xs text-text-quaternary mt-0.5">taux d'achèvement moyen</p>
        </div>
      </div>
      <div class="space-y-1">
        <div class="h-1.5 bg-surface rounded-full overflow-hidden">
          <div class="h-full bg-primary rounded-full transition-all duration-500" :style="{ width: `${avgCompletion}%` }" />
        </div>
        <p class="text-[11px] text-text-quaternary">
          {{ activeBagsCompleted }} / {{ activeBagsTotal }} QR codes complétés sur les processus actifs
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import { workflows } from '~/data/workflows'

const activeWorkflows     = workflows.filter((w) => w.status === 'active')
const activeBagsTotal     = activeWorkflows.reduce((s, w) => s + w.bagsTotal, 0)
const activeBagsCompleted = activeWorkflows.reduce((s, w) => s + w.bagsCompleted, 0)
const avgCompletion       = activeBagsTotal > 0
  ? Math.round((activeBagsCompleted / activeBagsTotal) * 100)
  : 0

const lastRefreshed = ref('Il y a 3 min')
const spinning      = ref(false)

function handleRefresh() {
  spinning.value = true
  setTimeout(() => {
    lastRefreshed.value = 'À l\'instant'
    spinning.value = false
  }, 700)
}
</script>
