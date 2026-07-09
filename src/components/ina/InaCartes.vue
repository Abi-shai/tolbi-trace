<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
    <Header title="Cartes">
      <template #actions>
        <DsButton label="Générer des cartes" variant="primary" icon-leading="plus" @click="showLot = true" />
      </template>
    </Header>

    <div class="flex flex-col flex-1 min-h-0 overflow-y-auto bg-surface">
      <div class="flex flex-col gap-4 p-6">

        <!-- Barre d'outils : recherche · filtre par statut · commander -->
        <div class="flex items-center gap-3 flex-wrap">
          <div class="w-full max-w-[320px]">
            <DsInputField v-model="search" placeholder="Rechercher un serial (ex: KLK-C0001)…">
              <template #icon-leading><DsIcon name="search-md" :size="20" class="text-text-quaternary" /></template>
            </DsInputField>
          </div>
          <div class="w-[200px] shrink-0">
            <DsInputDropdown v-model="statutFilter" :options="statutOptions" leading-icon="filter-funnel-01" />
          </div>
          <div class="flex-1" />
          <!-- Commander des cartes physiques : le web gère l'émission numérique
               (serials + QR) ; la fabrication physique est commandée à Tolbi, par
               périmètre de cartes. Remplace l'ancien « Télécharger la liste ». -->
          <DsDropdown v-model:open="orderOpen" trigger="button" button-label="Commander des cartes physiques">
            <DsDropdownItem
              v-for="opt in orderOptions"
              :key="opt.scope"
              :label="`${opt.label} (${opt.count})`"
              :disabled="opt.count === 0"
              @click="commanderPhysiques(opt)"
            />
          </DsDropdown>
        </div>

        <!-- Galerie : faces de cartes INA (grille responsive, tuiles blanches).
             À grande échelle, l'état = pill + accent QR (pas de fond teinté), pour
             rester calme (bench Mobbin : Airtable/Foundation/Glide inventory). -->
        <div v-if="tiles.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          <CarteInaTile
            v-for="t in tiles" :key="t.id"
            :statut="t.statut"
            :numero-ina="t.numeroIna"
            :holder="t.holder"
            :serial="t.serial"
            interactive
            @click="selectedCardId = t.id"
          />
        </div>

        <!-- État vide : aucun résultat de filtre, ou aucune carte émise -->
        <EmptyState
          v-else
          :title="cartesFiltrees ? 'Aucune carte' : 'Aucune carte émise'"
          :description="cartesFiltrees
            ? 'Aucune carte ne correspond à ta recherche ou à ce filtre.'
            : 'Génère tes premières cartes QR pour démarrer.'"
        >
          <template #icon>
            <DsIcon v-if="cartesFiltrees" name="search-md" :size="24" />
            <CreditCard v-else :size="24" />
          </template>
          <DsButton
            v-if="cartesFiltrees"
            label="Réinitialiser les filtres"
            variant="secondary-gray"
            @click="resetFilters"
          />
          <DsButton
            v-else
            label="Générer des cartes"
            variant="primary"
            icon-leading="plus"
            @click="showLot = true"
          />
        </EmptyState>

        <!-- Pagination -->
        <DsPagination v-if="tiles.length && totalPages > 1" :current-page="page" :total-pages="totalPages" @page-change="page = $event" />
      </div>
    </div>

    <GenererLotPanel v-if="showLot" @close="showLot = false" @generated="onGenerated" />
    <CarteDetailPanel v-if="selectedCardId" :carte-id="selectedCardId" @close="selectedCardId = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CreditCard } from 'lucide-vue-next'
import Header from '~/components/layout/Header.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import GenererLotPanel from '~/components/ina/GenererLotPanel.vue'
import CarteDetailPanel from '~/components/ina/CarteDetailPanel.vue'
import CarteInaTile from '~/components/ina/CarteInaTile.vue'
import { useInaStore } from '~/stores/ina'
import { useToastStore } from '~/stores/toast'
import { cycleOf, type Cycle } from '~/types/ina'

const ina = useInaStore()
ina.init()
const toast = useToastStore()

const showLot        = ref(false)
const search         = ref('')
const selectedCardId = ref<string | null>(null)

type Filter = 'toutes' | Cycle
const statutFilter = ref<Filter>('toutes')
const statutOptions = [
  { value: 'toutes',     label: 'Tous les statuts' },
  { value: 'emission',   label: 'Disponibles' },
  { value: 'activation', label: 'Associées'   },
  { value: 'revocation', label: 'Détruites'   },
]

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return ina.cartes.filter((c) => {
    if (statutFilter.value !== 'toutes' && cycleOf(c.statut) !== statutFilter.value) return false
    if (q && !c.serial.toLowerCase().includes(q)) return false
    return true
  })
})

// Une recherche ou un filtre est actif → l'état vide parle de « aucun résultat »
// (avec reset) plutôt que de « aucune carte émise » (avec génération de lot).
const cartesFiltrees = computed(() => !!search.value.trim() || statutFilter.value !== 'toutes')
function resetFilters() {
  search.value = ''
  statutFilter.value = 'toutes'
}

// ── Pagination (DsPagination) ────────────────────────────────────────────────
const page = ref(1)
const pageSize = 12
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const pageRows = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))
watch([search, statutFilter], () => { page.value = 1 })
watch(totalPages, () => { if (page.value > totalPages.value) page.value = totalPages.value })

const tiles = computed(() =>
  pageRows.value.map((c) => ({
    id:           c.id,
    producteurId: c.producteurId,
    statut:       c.statut,
    serial:       c.serial,
    bound:        !!c.producteurId,
    numeroIna:    numeroFor(c.producteurId),
    holder:       nomFor(c.producteurId),
  })),
)

function numeroFor(producteurId?: string) {
  if (!producteurId) return null
  return ina.identiteFor(producteurId)?.numeroIna ?? null
}
function nomFor(producteurId?: string) {
  if (!producteurId) return null
  const i = ina.identiteFor(producteurId)
  return i ? `${i.prenom} ${i.nom}` : null
}

// Commander des cartes physiques (émission → appro usine Tolbi, A2/ADR-0013). Le
// périmètre choisi cadre le lot à fabriquer : tout le parc, le stock vierge, ou les
// cartes déjà associées à un producteur. Le compte affiché aide à cadrer la quantité.
const orderOpen = ref(false)
const orderOptions = computed(() => {
  const c = ina.cartesParCycle
  return [
    { scope: 'toutes',      label: 'Toutes les cartes',      count: ina.cartes.length },
    { scope: 'disponibles', label: 'Les cartes disponibles', count: c.emission },
    { scope: 'associees',   label: 'Les cartes associées',   count: c.activation },
  ]
})
function commanderPhysiques(opt: { scope: string; count: number }) {
  orderOpen.value = false
  const noun = opt.count > 1 ? 'cartes' : 'carte'
  const adj =
    opt.scope === 'disponibles' ? (opt.count > 1 ? ' disponibles' : ' disponible')
    : opt.scope === 'associees' ? (opt.count > 1 ? ' associées' : ' associée')
    : ''
  toast.show({
    title:       'Demande envoyée',
    description: `L'équipe Tolbi te recontacte pour ta commande de ${opt.count} ${noun}${adj}.`,
    duration:    5000,
  })
}

function onGenerated(payload: { reference: string; quantite: number; commanderPhysiques: boolean }) {
  showLot.value = false
  toast.show({
    title:       'Cartes générées',
    description: payload.commanderPhysiques
      ? `${payload.quantite} cartes créées sous la référence ${payload.reference}. Un mail est parti à l'équipe Tolbi pour les produire et te les livrer.`
      : `${payload.quantite} cartes vierges créées sous la référence ${payload.reference}. Prêtes pour l'export d'impression.`,
    duration:    6000,
  })
}
</script>

<style scoped>
.mono { font-family: var(--ds-typography-font-family-inter); font-variant-numeric: tabular-nums; }
</style>
