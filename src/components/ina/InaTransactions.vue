<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
    <Header title="Transactions" />

    <div class="flex flex-col flex-1 min-h-0 overflow-y-auto bg-surface">
      <div class="flex flex-col gap-4 p-6">

        <!-- Table (carte dédiée) — ou état vide -->
        <div v-if="rows.length" class="bg-white rounded-xl border border-border overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-b border-border bg-[#f9fafb]">
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467]">Producteur</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467]">Transaction</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467]">Agent</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467]">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in pageRows" :key="t.id" class="border-b border-border last:border-b-0 bg-white hover:bg-[#f9fafb] transition-colors">
                  <td class="h-16 px-6 py-3 align-top">
                    <p class="text-sm font-semibold text-text-primary whitespace-nowrap">{{ nameFor(t.producteurId) }}</p>
                    <p class="text-xs text-text-tertiary mono">{{ t.numeroIna }} · {{ t.localite }}</p>
                  </td>
                  <td class="h-16 px-6 py-3 align-top text-sm text-text-primary max-w-[420px]">{{ t.explication }}</td>
                  <td class="h-16 px-6 py-3 align-top text-sm text-text-secondary whitespace-nowrap">{{ t.agent }}</td>
                  <td class="h-16 px-6 py-3 align-top text-sm text-text-tertiary whitespace-nowrap mono">{{ formatDateFr(t.date) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- État vide : le journal est en lecture seule (les transactions sont créées côté mobile) -->
        <EmptyState
          v-else
          title="Aucune transaction pour l'instant"
          description="Les transactions enregistrées par les agents sur le terrain apparaîtront ici."
        >
          <template #icon><ScrollText :size="24" /></template>
        </EmptyState>

        <!-- Pagination pleine largeur (Précédent à gauche, Suivant à droite) : DsPagination
             est un flex dont les côtés font flex:1 → rendu direct, sans wrapper centré. -->
        <DsPagination v-if="totalPages > 1" :current-page="page" :total-pages="totalPages" @page-change="page = $event" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ScrollText } from 'lucide-vue-next'
import Header from '~/components/layout/Header.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import { useInaStore } from '~/stores/ina'
import { formatDateFr } from '~/types/ina'

const ina = useInaStore()
ina.init()

// Journal en lecture seule, tri antéchronologique. Pas de filtre ni de recherche :
// côté terrain l'agent saisit une explication libre (pas de type à filtrer).
const rows = computed(() =>
  [...ina.transactions].sort((a, b) => b.date.localeCompare(a.date)),
)

// ── Pagination (DsPagination) ────────────────────────────────────────────────
const page = ref(1)
const pageSize = 10
const totalPages = computed(() => Math.max(1, Math.ceil(rows.value.length / pageSize)))
const pageRows = computed(() => rows.value.slice((page.value - 1) * pageSize, page.value * pageSize))
watch(totalPages, () => { if (page.value > totalPages.value) page.value = totalPages.value })

function nameFor(producteurId: string) {
  const i = ina.identiteFor(producteurId)
  return i ? `${i.prenom} ${i.nom}` : producteurId
}
</script>

<style scoped>
.mono { font-family: var(--ds-typography-font-family-inter); font-variant-numeric: tabular-nums; }
</style>
