<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
    <Header title="Identités" description="Producteurs enrôlés dans INA : carte, wallet et historique." />

    <div class="flex flex-col flex-1 min-h-0 overflow-y-auto bg-surface">
      <div class="flex flex-col gap-4 p-6">

        <div class="flex gap-4">
          <MetricCard :icon="Fingerprint" label="Identités actives"   :value="actives.toLocaleString('fr-FR')" />
          <MetricCard :icon="Wallet"      label="Encours des wallets" :value="formatFcfa(encoursTotal)" />
        </div>

        <div class="bg-white rounded-xl border border-border overflow-hidden flex flex-col">
          <!-- Recherche -->
          <div class="flex items-center gap-3 px-6 pt-4 pb-3">
            <div class="flex-1 relative">
              <div class="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"><Search :size="16" /></div>
              <input
                v-model="search"
                type="text"
                placeholder="Rechercher (nom, Numéro INA, téléphone)…"
                class="w-full h-10 pl-9 pr-3 border border-[#d0d5dd] rounded-lg text-sm text-text-secondary placeholder-text-quaternary bg-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors"
              />
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-t border-b border-border bg-[#f9fafb]">
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467]">Producteur</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467]">Numéro INA</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467]">Carte active</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467]">Statut</th>
                  <th class="h-11 px-6 py-3 text-right text-xs font-medium text-[#475467]">Solde wallet</th>
                  <th class="h-11 px-6 py-3 text-right text-xs font-medium text-[#475467]"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="r in filtered" :key="r.producteurId"
                  class="border-b border-border last:border-b-0 bg-white hover:bg-[#f9fafb] transition-colors cursor-pointer"
                  @click="selectedId = r.producteurId"
                >
                  <td class="h-16 px-6 py-3">
                    <div class="flex items-center gap-3">
                      <DsAvatar size="sm" :initials="initials(r.prenom, r.nom)" />
                      <div class="min-w-0">
                        <p class="text-sm font-semibold text-text-primary">{{ r.prenom }} {{ r.nom }}</p>
                        <p class="text-xs text-text-tertiary">{{ r.telephone }} · {{ r.localite }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="h-16 px-6 py-3 text-sm font-semibold text-text-primary mono">{{ r.numeroIna }}</td>
                  <td class="h-16 px-6 py-3 text-sm text-text-secondary">
                    <span v-if="r.carteActive" class="inline-flex items-center gap-1.5 mono"><QrCode :size="15" class="text-text-quaternary" /> {{ r.carteActive }}</span>
                    <span v-else class="text-text-quaternary">Aucune</span>
                  </td>
                  <td class="h-16 px-6 py-3">
                    <DsBadge :label="r.statut === 'active' ? 'Active' : 'Carte révoquée'" :color="r.statut === 'active' ? 'success' : 'error'" size="sm" dot />
                  </td>
                  <td class="h-16 px-6 py-3 text-right text-sm font-semibold text-text-primary mono">{{ formatFcfa(r.solde) }}</td>
                  <td class="h-16 px-6 py-3 text-right">
                    <ChevronRight :size="18" class="text-text-quaternary inline" />
                  </td>
                </tr>
                <tr v-if="filtered.length === 0">
                  <td colspan="6" class="h-24 text-center text-sm text-text-tertiary">Aucune identité pour cette recherche.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex items-center px-6 py-3 border-t border-border">
            <p class="text-[13px] text-text-secondary">{{ filtered.length.toLocaleString('fr-FR') }} identité{{ filtered.length > 1 ? 's' : '' }}</p>
          </div>
        </div>
      </div>
    </div>

    <FicheIna v-if="selectedId" :producteur-id="selectedId" @close="selectedId = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Fingerprint, Wallet, Search, QrCode, ChevronRight } from 'lucide-vue-next'
import Header from '~/components/layout/Header.vue'
import MetricCard from '~/components/ui/MetricCard.vue'
import FicheIna from '~/components/ina/FicheIna.vue'
import { useInaStore } from '~/stores/ina'
import { formatFcfa } from '~/types/ina'

const ina = useInaStore()
ina.init()

const search = ref('')
const selectedId = ref<string | null>(null)

const rows = computed(() =>
  ina.identites.map((i) => {
    const carte = ina.carteActiveFor(i.producteurId)
    return {
      ...i,
      statut:      ina.statutFor(i.producteurId),
      carteActive: carte?.serial ?? null,
      solde:       ina.walletFor(i.producteurId).solde,
    }
  }),
)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return rows.value
  return rows.value.filter((r) =>
    `${r.prenom} ${r.nom}`.toLowerCase().includes(q) ||
    r.numeroIna.includes(q) ||
    r.telephone.includes(q),
  )
})

const actives      = computed(() => rows.value.filter((r) => r.statut === 'active').length)
const encoursTotal = computed(() => rows.value.reduce((a, r) => a + Math.max(0, r.solde), 0))

function initials(prenom: string, nom: string) {
  return (prenom[0] ?? '') + (nom[0] ?? '')
}
</script>

<style scoped>
.mono { font-family: var(--ds-typography-font-family-inter); font-variant-numeric: tabular-nums; }
</style>
