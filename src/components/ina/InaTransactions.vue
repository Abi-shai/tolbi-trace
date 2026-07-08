<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
    <Header title="Transactions" description="Registre des flux financiers de la campagne, rattachés au Numéro INA.">
      <template #actions>
        <DsButton label="Exporter" variant="secondary-gray" icon-leading="download-01" @click="onExport" />
      </template>
    </Header>

    <div class="flex flex-col flex-1 min-h-0 overflow-y-auto bg-surface">
      <div class="flex flex-col gap-4 p-6">

        <div class="flex gap-4">
          <MetricCard :icon="ArrowDownLeft" label="Total entrées" :value="formatFcfa(totals.entrees)" />
          <MetricCard :icon="ArrowUpRight"  label="Total sorties" :value="formatFcfa(totals.sorties)" />
          <MetricCard :icon="Scale"         label="Net"           :value="formatFcfa(totals.entrees - totals.sorties)" />
        </div>

        <div class="bg-white rounded-xl border border-border overflow-hidden flex flex-col">
          <!-- Filtres -->
          <div class="flex items-center gap-3 px-6 pt-4 pb-3 flex-wrap">
            <div class="flex items-center gap-1 p-1 bg-[#f9fafb] border border-border rounded-[10px] shrink-0 flex-wrap">
              <button
                v-for="seg in segments" :key="seg.key"
                class="flex items-center h-9 px-3 rounded-md text-[13px] font-semibold transition-all"
                :class="categorie === seg.key ? 'bg-white shadow-[0px_1px_2px_rgba(16,24,40,0.06)] text-text-secondary' : 'text-text-quaternary'"
                @click="categorie = seg.key"
              >
                {{ seg.label }}
              </button>
            </div>
            <div class="flex-1 min-w-[200px] relative">
              <div class="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"><Search :size="16" /></div>
              <input
                v-model="search"
                type="text"
                placeholder="Rechercher (contrepartie, Numéro INA)…"
                class="w-full h-10 pl-9 pr-3 border border-[#d0d5dd] rounded-lg text-sm text-text-secondary placeholder-text-quaternary bg-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors"
              />
            </div>
          </div>

          <!-- Table groupée par mois -->
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-t border-b border-border bg-[#f9fafb]">
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467]">Producteur</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467]">Contrepartie</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467]">Catégorie</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467]">Date</th>
                  <th class="h-11 px-6 py-3 text-right text-xs font-medium text-[#475467]">Montant (FCFA)</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="group in grouped" :key="group.key">
                  <tr class="bg-[#fcfcfd] border-b border-border">
                    <td colspan="5" class="px-6 py-2 text-xs font-semibold uppercase tracking-wide text-text-quaternary">{{ group.label }}</td>
                  </tr>
                  <tr v-for="t in group.items" :key="t.id" class="border-b border-border last:border-b-0 bg-white hover:bg-[#f9fafb] transition-colors">
                    <td class="h-14 px-6 py-3">
                      <p class="text-sm font-semibold text-text-primary">{{ nameFor(t.producteurId) }}</p>
                      <p class="text-xs text-text-tertiary mono">{{ t.numeroIna }}</p>
                    </td>
                    <td class="h-14 px-6 py-3 text-sm text-text-secondary">{{ t.contrepartie }}</td>
                    <td class="h-14 px-6 py-3 text-sm text-text-tertiary">{{ TRANSACTION_CATEGORIE_META[t.categorie].label }}</td>
                    <td class="h-14 px-6 py-3 text-sm text-text-tertiary whitespace-nowrap mono">{{ formatDayShort(t.date) }}</td>
                    <td class="h-14 px-6 py-3 text-right text-sm font-semibold whitespace-nowrap mono" :class="t.sens === 'entree' ? 'text-[#067647]' : 'text-text-primary'">
                      {{ t.sens === 'entree' ? '+' : '−' }}{{ t.montant.toLocaleString('fr-FR') }}
                    </td>
                  </tr>
                </template>
                <tr v-if="filtered.length === 0">
                  <td colspan="5" class="h-24 text-center text-sm text-text-tertiary">Aucune transaction pour ce filtre.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex items-center px-6 py-3 border-t border-border">
            <p class="text-[13px] text-text-secondary">{{ filtered.length.toLocaleString('fr-FR') }} transaction{{ filtered.length > 1 ? 's' : '' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowDownLeft, ArrowUpRight, Scale, Search } from 'lucide-vue-next'
import Header from '~/components/layout/Header.vue'
import MetricCard from '~/components/ui/MetricCard.vue'
import { useInaStore } from '~/stores/ina'
import { useToastStore } from '~/stores/toast'
import { TRANSACTION_CATEGORIE_META, formatFcfa, formatDayShort, formatMonthYear, type TransactionCategorie, type TransactionINA } from '~/types/ina'

const ina = useInaStore()
ina.init()
const toast = useToastStore()

const search = ref('')
type Filter = 'toutes' | TransactionCategorie
const categorie = ref<Filter>('toutes')

const segments = [
  { key: 'toutes' as Filter,      label: 'Toutes'      },
  { key: 'financement' as Filter, label: 'Financement' },
  { key: 'ressources' as Filter,  label: 'Ressources'  },
  { key: 'prestations' as Filter, label: 'Prestations' },
  { key: 'transport' as Filter,   label: 'Transport'   },
  { key: 'revente' as Filter,     label: 'Revente'     },
]

const sorted = computed(() => [...ina.transactions].sort((a, b) => b.date.localeCompare(a.date)))

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return sorted.value.filter((t) => {
    if (categorie.value !== 'toutes' && t.categorie !== categorie.value) return false
    if (q && !t.contrepartie.toLowerCase().includes(q) && !t.numeroIna.includes(q)) return false
    return true
  })
})

// Groupement par mois (patron Quicken) : réduit la répétition des dates.
const grouped = computed(() => {
  const map = new Map<string, TransactionINA[]>()
  for (const t of filtered.value) {
    const key = t.date.slice(0, 7) // YYYY-MM
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(t)
  }
  return [...map.entries()].map(([key, items]) => ({ key, label: formatMonthYear(items[0].date), items }))
})

const totals = computed(() => ({
  entrees: filtered.value.filter((t) => t.sens === 'entree').reduce((a, t) => a + t.montant, 0),
  sorties: filtered.value.filter((t) => t.sens === 'sortie').reduce((a, t) => a + t.montant, 0),
}))

function nameFor(producteurId: string) {
  const i = ina.identiteFor(producteurId)
  return i ? `${i.prenom} ${i.nom}` : producteurId
}

function onExport() {
  toast.show({ title: 'Export lancé', description: 'Le registre des transactions est exporté au format CSV.', duration: 5000 })
}
</script>

<style scoped>
.mono { font-family: var(--ds-typography-font-family-inter); font-variant-numeric: tabular-nums; }
</style>
