<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
    <Header title="Identités numériques agricoles" actions-align="center">
      <template #actions>
        <DsButton label="Voir les producteurs sur ID" variant="secondary-gray" icon-trailing="arrow-up-right" @click="goToId" />
      </template>
    </Header>

    <div class="flex flex-col flex-1 min-h-0 overflow-y-auto bg-surface">
      <div class="flex flex-col gap-4 p-6">

        <!-- Barre d'outils (autonome, séparée de la table) -->
        <div class="flex items-center gap-3 flex-wrap">
          <div class="w-full max-w-[320px]">
            <DsInputField v-model="search" placeholder="Rechercher (nom, prénom, téléphone)…">
              <template #icon-leading><DsIcon name="search-md" :size="20" class="text-text-quaternary" /></template>
            </DsInputField>
          </div>
          <div class="w-[200px] shrink-0">
            <DsInputDropdown v-model="statutFilter" :options="statutOptions" leading-icon="filter-funnel-01" />
          </div>
        </div>

        <!-- Table (carte dédiée) — ou état vide -->
        <div v-if="filtered.length" class="bg-white rounded-xl border border-border overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-b border-border bg-[#f9fafb]">
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467]">Nom et prénom</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467]">Téléphone</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467]">Statut INA</th>
                  <th class="h-11 px-6 py-3 text-left text-xs font-medium text-[#475467]">Carte associée</th>
                  <th class="h-11 px-6 py-3 text-right text-xs font-medium text-[#475467]"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in pageRows" :key="r.id" class="group border-b border-border last:border-b-0 bg-white hover:bg-[#f9fafb] transition-colors">
                  <td class="h-16 px-6 py-3">
                    <div class="flex items-center gap-3">
                      <DsAvatar size="sm" :initials="initials(r.prenom, r.nom)" />
                      <span class="text-sm font-semibold text-text-primary whitespace-nowrap">{{ r.prenom }} {{ r.nom }}</span>
                    </div>
                  </td>
                  <td class="h-16 px-6 py-3 text-sm text-text-secondary whitespace-nowrap mono">{{ r.telephone }}</td>
                  <td class="h-16 px-6 py-3">
                    <DsBadge :label="r.activated ? 'Activé' : 'Pas activé'" :color="r.activated ? 'success' : 'gray'" variant="pill-color" size="sm" />
                  </td>
                  <td class="h-16 px-6 py-3">
                    <DsBadge
                      v-if="r.activated && r.carteAssociee"
                      :label="CARTE_ASSOCIEE_META[r.carteAssociee].label"
                      :color="CARTE_ASSOCIEE_META[r.carteAssociee].color"
                      variant="pill-color"
                      size="sm"
                    />
                    <span v-else class="text-text-quaternary">—</span>
                  </td>
                  <td class="h-16 px-6 py-3">
                    <div class="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                      <!-- Sans statut INA : une seule action, activer -->
                      <DsButton
                        v-if="!r.activated"
                        label="Activer le statut INA"
                        variant="secondary-gray"
                        size="sm"
                        @click="onActivate(r)"
                      />
                      <!-- INA activé : voir la fiche (toujours) + associer une carte si aucune -->
                      <template v-else>
                        <DsButton
                          v-if="r.carteAssociee === 'non'"
                          label="Associer une carte"
                          variant="secondary-gray"
                          size="sm"
                          @click="onAssocierCarte(r)"
                        />
                        <button
                          type="button"
                          class="inline-flex items-center justify-center w-9 h-9 rounded-lg text-text-quaternary hover:text-text-secondary hover:bg-surface transition-colors"
                          title="Voir la fiche"
                          aria-label="Voir la fiche"
                          @click="selectedId = r.id"
                        >
                          <Eye :size="18" />
                        </button>
                      </template>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- État vide : aucun résultat de recherche/filtre, ou aucun producteur enrôlé -->
        <EmptyState
          v-else
          title="Aucun producteur"
          :description="identitesFiltrees
            ? 'Aucun producteur ne correspond à ta recherche ou à ce filtre.'
            : 'Les producteurs enrôlés dans ton organisation apparaîtront ici.'"
        >
          <template #icon>
            <DsIcon v-if="identitesFiltrees" name="search-md" :size="24" />
            <Users v-else :size="24" />
          </template>
          <DsButton
            v-if="identitesFiltrees"
            label="Réinitialiser les filtres"
            variant="secondary-gray"
            @click="resetFilters"
          />
          <DsButton
            v-else
            label="Voir les producteurs sur ID"
            variant="secondary-gray"
            icon-trailing="arrow-up-right"
            @click="goToId"
          />
        </EmptyState>

        <!-- Pagination (séparée de la table) -->
        <div v-if="totalPages > 1" class="flex items-center justify-center">
          <DsPagination :current-page="page" :total-pages="totalPages" @page-change="page = $event" />
        </div>
      </div>
    </div>

    <FicheIna v-if="selectedId" :producteur-id="selectedId" @close="selectedId = null" />
    <ActiverInaPanel v-if="activatingId" :producteur-id="activatingId" @close="activatingId = null" />
    <AssocierCartePanel v-if="associatingCardId" :producteur-id="associatingCardId" @close="associatingCardId = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Eye, Users } from 'lucide-vue-next'
import Header from '~/components/layout/Header.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import FicheIna from '~/components/ina/FicheIna.vue'
import ActiverInaPanel from '~/components/ina/ActiverInaPanel.vue'
import AssocierCartePanel from '~/components/ina/AssocierCartePanel.vue'
import { useProducteursStore } from '~/stores/producteurs'
import { useInaStore } from '~/stores/ina'
import { useUIStore } from '~/stores/ui'
import { CARTE_ASSOCIEE_META } from '~/types/ina'

const prod = useProducteursStore()
prod.init()
const ina = useInaStore()
ina.init()
const router = useRouter()
const route = useRoute()
const uiStore = useUIStore()

const search = ref('')
const selectedId = ref<string | null>(null)
const activatingId = ref<string | null>(null)
const associatingCardId = ref<string | null>(null)

// Ouvre directement la fiche d'un producteur si arrivé via ?producteur=<id>
// (ex. « Voir plus de détails » du panneau de détail d'une carte).
const focusProducteur = route.query.producteur
if (typeof focusProducteur === 'string' && ina.identiteFor(focusProducteur)) {
  selectedId.value = focusProducteur
}

type StatutFilter = 'tous' | 'active' | 'inactive'
const statutFilter = ref<StatutFilter>('tous')
const statutOptions = [
  { value: 'tous',     label: 'Tous les statuts' },
  { value: 'active',   label: 'INA activé'   },
  { value: 'inactive', label: 'Pas activé'   },
]

// Tous les producteurs du module ID ; statut INA = activé si une identité INA
// active existe. Carte = si activé, la carte physique est-elle remise ?
const rows = computed(() =>
  prod.base.map((p) => {
    const identite  = ina.identiteFor(p.id)
    // Statut INA = enrôlement : le Numéro INA est stable (ADR-0013), l'état
    // « activé » suit l'identité, pas la carte (qui peut être révoquée/réémise).
    const activated = !!identite
    return {
      id:          p.id,
      nom:         p.nom,
      prenom:      p.prenom,
      // Une fois enrôlé, on affiche le numéro confirmé sur l'identité INA
      // (il peut différer du numéro d'inscription si modifié à l'activation).
      telephone:   identite?.telephone ?? p.telephone,
      activated,
      carteAssociee: activated ? (identite?.carteAssociee ?? 'non') : null,
    }
  }),
)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return rows.value.filter((r) => {
    if (statutFilter.value === 'active' && !r.activated) return false
    if (statutFilter.value === 'inactive' && r.activated) return false
    if (q && !`${r.prenom} ${r.nom}`.toLowerCase().includes(q) && !r.telephone.includes(q)) return false
    return true
  })
})

// Recherche/filtre actif → l'état vide parle de « aucun résultat » (avec reset)
// plutôt que de « aucun producteur enrôlé » (avec renvoi vers le module ID).
const identitesFiltrees = computed(() => !!search.value.trim() || statutFilter.value !== 'tous')
function resetFilters() {
  search.value = ''
  statutFilter.value = 'tous'
}

// ── Pagination (DsPagination) ────────────────────────────────────────────────
const page = ref(1)
const pageSize = 10
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const pageRows = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))
watch([search, statutFilter], () => { page.value = 1 })
watch(totalPages, () => { if (page.value > totalPages.value) page.value = totalPages.value })

function initials(prenom: string, nom: string) {
  return (prenom[0] ?? '') + (nom[0] ?? '')
}

// Ouvre le panneau d'activation du statut INA (numéro pré-rempli, OTP si modifié,
// association de carte optionnelle).
function onActivate(r: { id: string }) {
  activatingId.value = r.id
}

// Ouvre le panneau d'association de carte (même bloc toggle que l'activation).
function onAssocierCarte(r: { id: string }) {
  associatingCardId.value = r.id
}

// Renvoie vers le module ID, liste des producteurs (transition de module).
async function goToId() {
  uiStore.moduleTransition = true
  await Promise.all([
    router.push('/id/producteurs'),
    new Promise<void>((r) => setTimeout(r, 2000)),
  ])
  uiStore.moduleTransition = false
}
</script>

<style scoped>
.mono { font-family: var(--ds-typography-font-family-inter); font-variant-numeric: tabular-nums; }
</style>
