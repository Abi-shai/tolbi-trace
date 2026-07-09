<template>
  <SlideOverPanel
    v-if="carte"
    :title="`Carte ${carte.serial}`"
    :supporting-text="`Lot ${lotRef}`"
    :width="480"
    @close="$emit('close')"
  >
    <template #icon><CreditCard :size="20" /></template>

    <!-- La carte (même tuile que la galerie) -->
    <CarteInaTile
      :statut="carte.statut"
      :numero-ina="owner?.numeroIna ?? null"
      :holder="ownerNom"
      :serial="carte.serial"
    />

    <!-- Carte détruite : pas de propriétaire ni de transactions, juste un call-out -->
    <div v-if="destroyed" class="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border">
      <TriangleAlert :size="20" class="text-text-tertiary shrink-0" />
      <p class="text-sm font-medium text-text-primary">
        {{ carte.revokedAt ? `Carte détruite le ${formatDateFr(carte.revokedAt)}` : 'Carte détruite' }}
      </p>
    </div>

    <template v-else>
      <!-- Propriétaire de la carte : juste le nom + CTA vers la liste des identités -->
      <div class="flex flex-col gap-3">
        <p class="text-sm font-semibold text-text-secondary">Propriétaire</p>
        <div v-if="owner" class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <DsAvatar size="md" :initials="ownerInitials" />
            <p class="text-sm font-semibold text-text-primary truncate">{{ owner.prenom }} {{ owner.nom }}</p>
          </div>
          <DsButton label="Voir plus de détails" variant="secondary-gray" size="sm" icon-trailing="arrow-up-right" class="shrink-0" @click="goToIdentites" />
        </div>
        <div v-else class="rounded-lg border border-border">
          <EmptyState
            size="sm"
            title="Aucun propriétaire"
            description="Cette carte est disponible, pas encore associée à un producteur."
          >
            <template #icon><User :size="20" /></template>
          </EmptyState>
        </div>
      </div>

      <!-- Transactions faites avec cette carte -->
      <InaEvenementsList :transactions="transactions" />
    </template>
  </SlideOverPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { CreditCard, TriangleAlert, User } from 'lucide-vue-next'
import SlideOverPanel from '~/components/ui/SlideOverPanel.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import CarteInaTile from '~/components/ina/CarteInaTile.vue'
import InaEvenementsList from '~/components/ina/InaEvenementsList.vue'
import { useInaStore } from '~/stores/ina'
import { cycleOf, formatDateFr } from '~/types/ina'

const props = defineProps<{ carteId: string }>()
defineEmits<{ close: [] }>()

const ina = useInaStore()
ina.init()
const router = useRouter()

// « Voir plus de détails » → liste des Identités numériques agricoles, avec la
// fiche du producteur porteur ouverte directement (via ?producteur=<id>).
function goToIdentites() {
  const pid = owner.value?.producteurId
  router.push(pid ? `/ina/identites?producteur=${encodeURIComponent(pid)}` : '/ina/identites')
}

const carte = computed(() => ina.cartes.find((c) => c.id === props.carteId) ?? null)
const owner = computed(() => (carte.value?.producteurId ? ina.identiteFor(carte.value.producteurId) : null))
// Carte détruite (révoquée) : on masque propriétaire + transactions, juste un call-out.
const destroyed = computed(() => (carte.value ? cycleOf(carte.value.statut) === 'revocation' : false))

const ownerNom      = computed(() => (owner.value ? `${owner.value.prenom} ${owner.value.nom}` : null))
const ownerInitials = computed(() => (owner.value ? (owner.value.prenom[0] ?? '') + (owner.value.nom[0] ?? '') : ''))
const lotRef        = computed(() => (carte.value ? ina.lots.find((l) => l.id === carte.value!.lotId)?.reference ?? carte.value.lotId : ''))

// Transactions rattachées à CETTE carte (par serial = credential scanné).
const transactions = computed(() =>
  carte.value
    ? [...ina.transactions.filter((t) => t.carteSerial === carte.value!.serial)].sort((a, b) => b.date.localeCompare(a.date))
    : [],
)
</script>

<style scoped>
.mono { font-family: var(--ds-typography-font-family-inter); font-variant-numeric: tabular-nums; }
</style>
