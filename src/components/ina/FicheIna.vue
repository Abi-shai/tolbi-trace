<template>
  <SlideOverPanel
    :title="identite ? `${identite.prenom} ${identite.nom}` : 'Identité INA'"
    :width="480"
    :icon-frame="false"
    @close="$emit('close')"
  >
    <template v-if="identite" #icon>
      <DsAvatar size="lg" :initials="initials" />
    </template>

    <template v-if="identite">
      <!-- Onglets : Détails / Carte / Transactions (segmented control DS) -->
      <DsTabs v-model="tab" :tabs="tabs" size="sm" />

      <!-- Détails : identité de l'enrôlement, une ligne par champ (libellé | valeur) -->
      <div v-if="tab === 'details'" class="flex flex-col gap-4">
        <div v-for="f in detailFields" :key="f.key" class="flex items-center gap-6">
          <p class="flex-1 min-w-0 text-base text-text-secondary leading-6">{{ f.label }}</p>

          <!-- Statut : badge ; autres champs : valeur en boîte -->
          <div v-if="f.key === 'statut'" class="flex-1 min-w-0 flex items-center py-1">
            <DsBadge :label="statutBadge.label" :color="statutBadge.color" variant="pill-color" size="sm" />
          </div>
          <div v-else class="flex-1 min-w-0 flex items-center px-3 py-1 bg-surface rounded-lg">
            <p
              class="flex-1 min-w-0 text-base font-medium text-text-primary leading-6"
              :class="{ mono: f.mono }"
              style="font-family: var(--ds-typography-font-family-inter)"
            >{{ f.value }}</p>
          </div>
        </div>

        <!-- Accès à la fiche complète du producteur sur le module ID -->
        <div class="flex pt-1">
          <DsButton
            label="Voir toutes les infos sur ID"
            variant="secondary-gray"
            size="sm"
            icon-trailing="arrow-up-right"
            @click="goToIdDetails"
          />
        </div>
      </div>

      <!-- Carte : empty-state si aucune carte, sinon visuel credential + action + historique -->
      <div v-else-if="tab === 'carte'" class="flex flex-col gap-5">
        <!-- Sans carte : pas de visuel de carte, un état vide -->
        <EmptyState
          v-if="sansCarte"
          size="sm"
          title="Aucune carte associée"
          description="Ce producteur a un statut INA actif, mais aucune carte QR ne lui est encore rattachée."
        >
          <template #icon><CreditCard :size="20" /></template>
          <DsButton label="Associer une carte" variant="secondary-gray" size="sm" icon-leading="plus" @click="showAssocier = true" />
        </EmptyState>

        <!-- Avec carte : même tuile que la galerie Cartes (représentation cohérente) + action + historique -->
        <template v-else>
          <CarteInaTile
            :statut="statut === 'active' ? 'activee' : 'revoquee'"
            :numero-ina="identite.numeroIna"
            :holder="`${identite.prenom} ${identite.nom}`"
            :serial="activeSerial"
          />

          <!-- Action contextuelle (pas de barre d'actions : l'action vit dans l'onglet) -->
          <div class="flex">
            <DsButton label="Révoquer & réémettre" variant="secondary-gray" size="sm" icon-leading="refresh-cw-01" @click="reissue" />
          </div>

          <!-- Historique des cartes -->
          <div class="flex flex-col gap-2">
            <p class="text-sm font-semibold text-text-secondary">Historique des cartes</p>
            <div v-for="c in cartes" :key="c.id" class="flex items-center gap-3 p-3 rounded-lg border border-border">
              <QrCode :size="18" class="text-text-quaternary shrink-0" />
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-text-primary mono">{{ c.serial }}</p>
                <p class="text-xs text-text-tertiary">{{ c.statut === 'activee' ? `Activée le ${formatDateFr(c.activatedAt!)}` : c.revokedAt ? `Révoquée le ${formatDateFr(c.revokedAt)}` : '—' }}</p>
              </div>
              <DsBadge class="shrink-0" :label="CARTE_STATUT_META[c.statut].label" :color="CARTE_STATUT_META[c.statut].color" size="sm" />
            </div>
          </div>
        </template>
      </div>

      <!-- Transactions : journal d'événements logistiques (composant partagé) -->
      <div v-else>
        <InaEvenementsList :transactions="transactions" />
      </div>
    </template>
  </SlideOverPanel>

  <!-- Association de carte (ouverte depuis l'empty-state de l'onglet Carte) -->
  <AssocierCartePanel v-if="showAssocier" :producteur-id="producteurId" @close="showAssocier = false" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { QrCode, CreditCard } from 'lucide-vue-next'
import SlideOverPanel from '~/components/ui/SlideOverPanel.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import AssocierCartePanel from '~/components/ina/AssocierCartePanel.vue'
import CarteInaTile from '~/components/ina/CarteInaTile.vue'
import InaEvenementsList from '~/components/ina/InaEvenementsList.vue'
import { useInaStore } from '~/stores/ina'
import { useToastStore } from '~/stores/toast'
import { useUIStore } from '~/stores/ui'
import { CARTE_STATUT_META, formatDateFr, type BadgeColor } from '~/types/ina'

const props = defineProps<{ producteurId: string }>()
defineEmits<{ close: [] }>()

const ina = useInaStore()
ina.init()
const toast = useToastStore()
const router = useRouter()
const uiStore = useUIStore()

const showAssocier = ref(false)
const tab = ref<'details' | 'carte' | 'transactions'>('details')
const tabs = [
  { label: 'Informations', value: 'details' },
  { label: 'Carte',        value: 'carte' },
  { label: 'Transactions', value: 'transactions' },
]

const identite     = computed(() => ina.identiteFor(props.producteurId))
const statut       = computed(() => ina.statutFor(props.producteurId))
// Identité enrôlée sans aucune carte (activation sans association de carte) :
// l'INA est actif mais aucun credential physique n'est encore rattaché.
const sansCarte    = computed(() => ina.cartesFor(props.producteurId).length === 0)
const activeSerial = computed(() => ina.carteActiveFor(props.producteurId)?.serial ?? null)
// Carte active en tête, puis historique le plus récent d'abord.
const cartes       = computed(() => [...ina.cartesFor(props.producteurId)].sort((a, b) =>
  (a.statut === 'activee' ? -1 : 1) - (b.statut === 'activee' ? -1 : 1)))
const transactions = computed(() => [...ina.transactionsFor(props.producteurId)].sort((a, b) => b.date.localeCompare(a.date)))

const initials = computed(() => {
  const i = identite.value
  return i ? (i.prenom[0] ?? '') + (i.nom[0] ?? '') : ''
})

// Statut de credential affiché dans l'onglet Détails (couleur = signal).
const statutBadge = computed<{ label: string; color: BadgeColor }>(() => {
  if (sansCarte.value)          return { label: 'Aucune carte',   color: 'gray'    }
  if (statut.value === 'active') return { label: 'Carte active',   color: 'success' }
  return                                { label: 'Carte révoquée', color: 'error'   }
})

const detailFields = computed(() => {
  const i = identite.value!
  return [
    { key: 'numeroIna',   label: 'INA',         value: i.numeroIna, mono: true },
    { key: 'statut',      label: 'Statut'                          },
    { key: 'cooperative', label: 'Coopérative', value: i.cooperative },
    { key: 'localite',    label: 'Localité',    value: i.localite    },
    { key: 'telephone',   label: 'Téléphone',   value: i.telephone, mono: true },
    { key: 'enrole',      label: 'Activé le',   value: formatDateFr(i.enrolledAt) },
  ]
})

// « Voir tous les détails sur ID » — le module ID porte la fiche riche du producteur
// (parcelles, surface, code parcelles…). On y navigue avec la transition de module,
// liste pré-filtrée sur ce producteur (cf. ProducteursClient/ProducteursListe).
async function goToIdDetails() {
  uiStore.moduleTransition = true
  await Promise.all([
    router.push(`/id/producteurs?producteur=${encodeURIComponent(props.producteurId)}`),
    new Promise<void>((r) => setTimeout(r, 2000)),
  ])
  uiStore.moduleTransition = false
}

function reissue() {
  const wasSansCarte = sansCarte.value
  const serial = ina.revoquerReemettre(props.producteurId)
  toast.show({
    title:       wasSansCarte ? 'Carte associée' : 'Carte réémise',
    description: wasSansCarte
      ? `Carte ${serial} associée et activée.`
      : `Nouvelle carte ${serial} activée. Le Numéro INA et l'historique sont conservés.`,
    duration:    6000,
  })
}
</script>

<style scoped>
.mono { font-family: var(--ds-typography-font-family-inter); font-variant-numeric: tabular-nums; }
</style>
