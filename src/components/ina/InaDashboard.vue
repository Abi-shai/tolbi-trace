<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
    <Header title="Tableau de bord" description="Déploiement des cartes INA et flux de la campagne." />

    <div class="flex flex-col flex-1 min-h-0 overflow-y-auto bg-surface">
      <div class="flex flex-col gap-4 p-6">

        <!-- Métriques -->
        <div class="flex gap-4">
          <MetricCard :icon="CreditCard"  label="Cartes émises"     :value="kpis.emises.toLocaleString('fr-FR')" />
          <MetricCard :icon="BadgeCheck"  label="Cartes activées"   :value="kpis.activees.toLocaleString('fr-FR')" />
          <MetricCard :icon="TrendingUp"  label="Taux d'activation" :value="kpis.taux + ' %'" />
          <MetricCard :icon="ArrowLeftRight" label="Transactions"   :value="kpis.transactions.toLocaleString('fr-FR')" />
        </div>

        <div class="flex gap-4 items-stretch">
          <!-- Cycle des cartes -->
          <div class="flex-1 bg-white rounded-xl border border-border p-6 flex flex-col gap-5">
            <div class="flex items-center justify-between">
              <p class="text-lg font-semibold text-text-primary">Cycle des cartes</p>
              <button class="text-sm font-semibold text-primary" @click="router.push('/ina/cartes')">Voir les cartes</button>
            </div>

            <!-- Barre de progression : émises → distribuées → activées -->
            <div class="flex flex-col gap-2">
              <div class="h-3 w-full overflow-hidden rounded-full bg-surface flex">
                <div class="h-full bg-[#17b26a]" :style="{ width: pct(kpis.activees) + '%' }" />
                <div class="h-full bg-[#fdb022]" :style="{ width: pct(kpis.distribuees - kpis.activees) + '%' }" />
              </div>
              <div class="flex items-center gap-4 text-xs text-text-tertiary">
                <span class="flex items-center gap-1.5"><span class="size-2 rounded-full bg-[#17b26a]" /> Activées</span>
                <span class="flex items-center gap-1.5"><span class="size-2 rounded-full bg-[#fdb022]" /> Distribuées, non activées</span>
                <span class="flex items-center gap-1.5"><span class="size-2 rounded-full bg-surface border border-border" /> En entrepôt</span>
              </div>
            </div>

            <!-- Répartition détaillée -->
            <div class="grid grid-cols-2 gap-x-8 gap-y-3">
              <div v-for="s in flow" :key="s.statut" class="flex items-center justify-between border-b border-border pb-2 last:border-b-0">
                <DsBadge :label="s.label" :color="s.color" size="sm" dot />
                <span class="text-lg font-semibold text-text-primary mono">{{ s.count.toLocaleString('fr-FR') }}</span>
              </div>
            </div>
          </div>

          <!-- Colonne latérale : doublons + dernières transactions -->
          <div class="w-[360px] shrink-0 flex flex-col gap-4">
            <!-- Doublons -->
            <div class="bg-white rounded-xl border border-border p-5 flex items-start gap-3">
              <div class="flex items-center justify-center size-10 rounded-lg bg-[#fffaeb] shrink-0">
                <Copy :size="20" class="text-[#dc6803]" />
              </div>
              <div class="min-w-0">
                <p class="text-2xl font-bold text-text-primary leading-8">{{ kpis.doublons }}</p>
                <p class="text-sm text-text-tertiary">doublon détecté par numéro de téléphone</p>
              </div>
            </div>

            <!-- Dernières transactions -->
            <div class="flex-1 bg-white rounded-xl border border-border p-5 flex flex-col gap-3 min-h-0">
              <div class="flex items-center justify-between">
                <p class="text-base font-semibold text-text-primary">Transactions récentes</p>
                <button class="text-sm font-semibold text-primary" @click="router.push('/ina/transactions')">Tout voir</button>
              </div>
              <div class="flex flex-col divide-y divide-border">
                <div v-for="t in recent" :key="t.id" class="flex items-center gap-3 py-2.5">
                  <div class="flex items-center justify-center size-8 rounded-full shrink-0" :class="t.sens === 'entree' ? 'bg-[#ecfdf3]' : 'bg-[#fef3f2]'">
                    <component :is="t.sens === 'entree' ? ArrowDownLeft : ArrowUpRight" :size="15" :class="t.sens === 'entree' ? 'text-[#067647]' : 'text-[#b42318]'" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-semibold text-text-primary truncate">{{ t.contrepartie }}</p>
                    <p class="text-xs text-text-tertiary truncate">{{ TRANSACTION_CATEGORIE_META[t.categorie].label }} · {{ formatDateFr(t.date) }}</p>
                  </div>
                  <span class="text-sm font-semibold shrink-0 mono" :class="t.sens === 'entree' ? 'text-[#067647]' : 'text-text-primary'">
                    {{ t.sens === 'entree' ? '+' : '−' }}{{ t.montant.toLocaleString('fr-FR') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { CreditCard, BadgeCheck, TrendingUp, ArrowLeftRight, Copy, ArrowDownLeft, ArrowUpRight } from 'lucide-vue-next'
import Header from '~/components/layout/Header.vue'
import MetricCard from '~/components/ui/MetricCard.vue'
import { useInaStore } from '~/stores/ina'
import { CARTE_STATUT_META, TRANSACTION_CATEGORIE_META, formatDateFr, type CarteStatut } from '~/types/ina'

const router = useRouter()
const ina = useInaStore()
ina.init()

const kpis = computed(() => ina.kpis)

const flow = computed(() => {
  const counts = ina.cartesParStatut
  const order: CarteStatut[] = ['generee', 'imprimee', 'distribuee', 'activee', 'revoquee']
  return order
    .filter((s) => (counts[s] ?? 0) > 0)
    .map((s) => ({ statut: s, label: CARTE_STATUT_META[s].label, color: CARTE_STATUT_META[s].color, count: counts[s] ?? 0 }))
})

// Barre de progression, en proportion du nombre de cartes émises.
function pct(n: number) {
  return kpis.value.emises ? Math.round((n / kpis.value.emises) * 100) : 0
}

const recent = computed(() =>
  [...ina.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
)
</script>

<style scoped>
.mono { font-family: var(--ds-typography-font-family-inter); font-variant-numeric: tabular-nums; }
</style>
