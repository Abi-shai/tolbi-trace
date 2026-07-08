<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
    <Header title="Cartes">
      <template #actions>
        <DsButton label="Générer un lot" variant="primary" icon-leading="plus" @click="showLot = true" />
      </template>
    </Header>

    <div class="flex flex-col flex-1 min-h-0 overflow-y-auto bg-surface">
      <div class="flex flex-col gap-4 p-6">

        <!-- Métriques -->
        <div class="flex gap-4">
          <MetricCard :icon="CreditCard"  label="Cartes émises"     :value="kpis.emises.toLocaleString('fr-FR')" />
          <MetricCard :icon="Send"        label="Cartes distribuées" :value="kpis.distribuees.toLocaleString('fr-FR')" />
          <MetricCard :icon="BadgeCheck"  label="Cartes activées"   :value="kpis.activees.toLocaleString('fr-FR')" />
        </div>

        <!-- Carte principale -->
        <div class="bg-white rounded-xl border border-border overflow-hidden flex flex-col">

          <!-- Barre d'outils : filtre par statut + recherche -->
          <div class="flex items-center gap-3 px-6 pt-4 pb-3 flex-wrap">
            <div class="flex items-center gap-1 p-1 bg-[#f9fafb] border border-border rounded-[10px] shrink-0">
              <button
                v-for="seg in segments" :key="seg.key"
                class="flex items-center gap-2 h-9 px-3 rounded-md text-[13px] font-semibold transition-all"
                :class="statut === seg.key ? 'bg-white shadow-[0px_1px_2px_rgba(16,24,40,0.06)] text-text-secondary' : 'text-text-quaternary'"
                @click="statut = seg.key"
              >
                {{ seg.label }}
                <span class="px-1.5 py-px rounded-full text-xs font-semibold bg-[#f2f4f7] text-[#475467]">{{ seg.count.toLocaleString('fr-FR') }}</span>
              </button>
            </div>

            <div class="flex-1 min-w-[200px] relative">
              <div class="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"><Search :size="16" /></div>
              <input
                v-model="search"
                type="text"
                placeholder="Rechercher un serial (ex: KLK-C0001)…"
                class="w-full h-10 pl-9 pr-3 border border-[#d0d5dd] rounded-lg text-sm text-text-secondary placeholder-text-quaternary bg-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors"
              />
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-t border-b border-border bg-[#f9fafb]">
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467]">Serial de carte</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467]">Lot</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467]">Statut</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467]">Producteur (Numéro INA)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in filtered" :key="c.id" class="border-b border-border last:border-b-0 bg-white hover:bg-[#f9fafb] transition-colors">
                  <td class="h-14 px-6 py-3">
                    <span class="inline-flex items-center gap-2 text-sm font-semibold text-text-primary mono">
                      <QrCode :size="16" class="text-text-quaternary" />
                      {{ c.serial }}
                    </span>
                  </td>
                  <td class="h-14 px-6 py-3 text-sm text-text-secondary mono">{{ lotRef(c.lotId) }}</td>
                  <td class="h-14 px-6 py-3">
                    <DsBadge :label="CARTE_STATUT_META[c.statut].label" :color="CARTE_STATUT_META[c.statut].color" size="sm" dot />
                  </td>
                  <td class="h-14 px-6 py-3 text-sm text-text-secondary">
                    <span v-if="numeroFor(c.producteurId)" class="font-semibold text-text-primary mono">{{ numeroFor(c.producteurId) }}</span>
                    <span v-else class="text-text-quaternary">—</span>
                  </td>
                </tr>
                <tr v-if="filtered.length === 0">
                  <td colspan="4" class="h-24 text-center text-sm text-text-tertiary">Aucune carte pour ce filtre.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex items-center px-6 py-3 border-t border-border">
            <p class="text-[13px] text-text-secondary">{{ filtered.length.toLocaleString('fr-FR') }} carte{{ filtered.length > 1 ? 's' : '' }} affichée{{ filtered.length > 1 ? 's' : '' }}</p>
          </div>
        </div>
      </div>
    </div>

    <GenererLotPanel v-if="showLot" @close="showLot = false" @generated="onGenerated" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CreditCard, Send, BadgeCheck, Search, QrCode } from 'lucide-vue-next'
import Header from '~/components/layout/Header.vue'
import MetricCard from '~/components/ui/MetricCard.vue'
import GenererLotPanel from '~/components/ina/GenererLotPanel.vue'
import { useInaStore } from '~/stores/ina'
import { useToastStore } from '~/stores/toast'
import { CARTE_STATUT_META, type CarteStatut } from '~/types/ina'

const ina = useInaStore()
ina.init()
const toast = useToastStore()

const kpis   = computed(() => ina.kpis)
const showLot = ref(false)
const search = ref('')

type Filter = 'toutes' | CarteStatut
const statut = ref<Filter>('toutes')

const segments = computed(() => {
  const c = ina.cartesParStatut
  return [
    { key: 'toutes' as Filter,     label: 'Toutes',      count: ina.cartes.length },
    { key: 'generee' as Filter,    label: 'Générées',    count: c.generee ?? 0 },
    { key: 'imprimee' as Filter,   label: 'Imprimées',   count: c.imprimee ?? 0 },
    { key: 'distribuee' as Filter, label: 'Distribuées', count: c.distribuee ?? 0 },
    { key: 'activee' as Filter,    label: 'Activées',    count: c.activee ?? 0 },
    { key: 'revoquee' as Filter,   label: 'Révoquées',   count: c.revoquee ?? 0 },
  ]
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return ina.cartes.filter((c) => {
    if (statut.value !== 'toutes' && c.statut !== statut.value) return false
    if (q && !c.serial.toLowerCase().includes(q)) return false
    return true
  })
})

function lotRef(lotId: string) {
  return ina.lots.find((l) => l.id === lotId)?.reference ?? lotId
}
function numeroFor(producteurId?: string) {
  if (!producteurId) return null
  return ina.identiteFor(producteurId)?.numeroIna ?? null
}

function onGenerated(payload: { reference: string; quantite: number }) {
  showLot.value = false
  toast.show({
    title:       'Lot généré',
    description: `${payload.quantite} cartes vierges créées dans le lot ${payload.reference}. Prêtes pour l'export d'impression.`,
    duration:    6000,
  })
}
</script>

<style scoped>
.mono { font-family: var(--ds-typography-font-family-inter); font-variant-numeric: tabular-nums; }
</style>
