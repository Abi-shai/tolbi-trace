<template>
  <SlideOverPanel
    :title="identite ? `${identite.prenom} ${identite.nom}` : 'Identité INA'"
    :supporting-text="identite ? `Numéro INA · ${identite.numeroIna}` : ''"
    :width="480"
    @close="$emit('close')"
  >
    <template #icon><Fingerprint :size="20" /></template>

    <template v-if="identite">
      <!-- Wallet -->
      <div class="rounded-xl border border-border p-5 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary"><Wallet :size="16" class="text-text-quaternary" /> Wallet TOLBI</span>
          <DsBadge :label="statut === 'active' ? 'Carte active' : 'Carte révoquée'" :color="statut === 'active' ? 'success' : 'error'" size="sm" dot />
        </div>
        <p class="text-3xl font-bold text-[#056033] leading-9 mono">{{ formatFcfa(wallet.solde) }}</p>
        <div class="flex gap-4">
          <div class="flex-1 flex items-center gap-2">
            <ArrowDownLeft :size="16" class="text-[#067647]" />
            <div>
              <p class="text-xs text-text-tertiary">Entrées</p>
              <p class="text-sm font-semibold text-text-primary mono">{{ formatFcfa(wallet.entrees) }}</p>
            </div>
          </div>
          <div class="flex-1 flex items-center gap-2">
            <ArrowUpRight :size="16" class="text-[#b42318]" />
            <div>
              <p class="text-xs text-text-tertiary">Sorties</p>
              <p class="text-sm font-semibold text-text-primary mono">{{ formatFcfa(wallet.sorties) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Cartes -->
      <div class="flex flex-col gap-2">
        <p class="text-sm font-semibold text-text-secondary">Cartes</p>
        <div v-for="c in cartes" :key="c.id" class="flex items-center gap-3 p-3 rounded-lg border border-border">
          <QrCode :size="18" class="text-text-quaternary shrink-0" />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-text-primary mono">{{ c.serial }}</p>
            <p class="text-xs text-text-tertiary">{{ c.statut === 'activee' ? `Activée le ${formatDateFr(c.activatedAt!)}` : c.revokedAt ? `Révoquée le ${formatDateFr(c.revokedAt)}` : '—' }}</p>
          </div>
          <DsBadge class="shrink-0" :label="CARTE_STATUT_META[c.statut].label" :color="CARTE_STATUT_META[c.statut].color" size="sm" dot />
        </div>
      </div>

      <!-- Transactions -->
      <div class="flex flex-col gap-2">
        <p class="text-sm font-semibold text-text-secondary">Transactions ({{ transactions.length }})</p>
        <div class="flex flex-col divide-y divide-border rounded-lg border border-border">
          <div v-for="t in transactions" :key="t.id" class="flex items-center gap-3 p-3">
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
          <p v-if="transactions.length === 0" class="p-3 text-sm text-text-tertiary text-center">Aucune transaction.</p>
        </div>
      </div>
    </template>

    <template #footer="{ close }">
      <DsButton label="Fermer" variant="secondary-gray" @click="close" />
      <DsButton label="Révoquer & réémettre" variant="primary" icon-leading="refresh-cw-01" @click="reissue" />
    </template>
  </SlideOverPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Fingerprint, Wallet, QrCode, ArrowDownLeft, ArrowUpRight } from 'lucide-vue-next'
import SlideOverPanel from '~/components/ui/SlideOverPanel.vue'
import { useInaStore } from '~/stores/ina'
import { useToastStore } from '~/stores/toast'
import { CARTE_STATUT_META, TRANSACTION_CATEGORIE_META, formatFcfa, formatDateFr } from '~/types/ina'

const props = defineProps<{ producteurId: string }>()
defineEmits<{ close: [] }>()

const ina = useInaStore()
ina.init()
const toast = useToastStore()

const identite     = computed(() => ina.identiteFor(props.producteurId))
const statut       = computed(() => ina.statutFor(props.producteurId))
const wallet       = computed(() => ina.walletFor(props.producteurId))
// Carte active en tête, puis historique le plus récent d'abord.
const cartes       = computed(() => [...ina.cartesFor(props.producteurId)].sort((a, b) =>
  (a.statut === 'activee' ? -1 : 1) - (b.statut === 'activee' ? -1 : 1)))
const transactions = computed(() => [...ina.transactionsFor(props.producteurId)].sort((a, b) => b.date.localeCompare(a.date)))

function reissue() {
  const serial = ina.revoquerReemettre(props.producteurId)
  toast.show({
    title:       'Carte réémise',
    description: `Nouvelle carte ${serial} activée. Le Numéro INA et l'historique sont conservés.`,
    duration:    6000,
  })
}
</script>

<style scoped>
.mono { font-family: var(--ds-typography-font-family-inter); font-variant-numeric: tabular-nums; }
</style>
