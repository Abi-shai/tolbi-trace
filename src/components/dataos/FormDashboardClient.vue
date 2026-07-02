<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden bg-surface content-arrive">

    <Header title="Suivi des réponses">
      <template #actions>
        <!-- Bouton « Synchroniser » : le compteur de données à synchroniser est
             intégré à droite (en miroir de l'icône de gauche). Le bouton s'élargit
             pour révéler le patch quand il y a des données, puis revient à sa taille
             initiale une fois synchronisé. Recomposé à partir des tokens DsButton
             (secondary-gray) — DsButton n'expose pas de slot de contenu trailing —
             et animé avec les tokens de motion du design system. -->
        <button class="sync-btn" :disabled="syncing" :aria-busy="syncing || undefined" @click="sync">
          <span v-if="syncing" class="sync-btn__spinner" aria-hidden="true" />
          <template v-else>
            <DsIcon name="refresh-ccw-01" :size="20" class="shrink-0" />
            <span>Synchroniser vers ID</span>
            <Transition name="sync-badge" appear>
              <span v-if="pendingKyf > 0" class="sync-badge">
                <DsBadge :label="String(pendingKyf)" color="brand" variant="pill-color" size="sm" />
              </span>
            </Transition>
          </template>
        </button>
        <DsButton label="Terminer la collecte" variant="danger" @click="finishCollecte" />
      </template>
    </Header>

    <div class="flex-1 overflow-y-auto">
      <div class="flex flex-col gap-6 p-6">

        <!-- Métriques (composant partagé MetricCard) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            v-for="m in metrics"
            :key="m.label"
            :icon="m.icon"
            :label="m.label"
            :value="m.value"
          />
        </div>

        <!-- Bascule Data points / Polygones + recherche + actions -->
        <div class="flex flex-col gap-4">
          <div class="inline-flex self-start rounded-md border border-[#589b7a] shadow-[var(--ds-shadow-xs)] overflow-hidden">
            <button
              class="flex items-center gap-2 min-h-10 pl-3.5 pr-4 py-2 text-sm font-semibold tracking-[-0.14px] transition-colors border-r border-[#589b7a]"
              :class="view === 'data' ? 'bg-[#e6f0eb] text-[#056033]' : 'bg-white text-text-secondary'"
              @click="view = 'data'"
            >
              <LayoutGrid :size="20" /> Data points
            </button>
            <button
              class="flex items-center gap-2 min-h-10 pl-3.5 pr-4 py-2 text-sm font-semibold tracking-[-0.14px] transition-colors"
              :class="view === 'polygones' ? 'bg-[#e6f0eb] text-[#056033]' : 'bg-white text-text-secondary'"
              @click="view = 'polygones'"
            >
              <Map :size="20" /> Polygones
            </button>
          </div>

          <div class="h-px bg-border w-full" />

          <div class="flex items-center justify-between gap-3 flex-wrap">
            <div class="w-full max-w-[400px]">
              <DsInputField v-model="search" type="text" placeholder="Rechercher un agent..">
                <template #icon-leading>
                  <DsIcon name="search-md" />
                </template>
              </DsInputField>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <DsButton label="Télécharger la liste" variant="secondary-gray" icon-leading="download-01" />
              <DsButton label="Réorganiser la liste" variant="secondary-gray" icon-leading="switch-vertical-01" />
            </div>
          </div>
        </div>

        <!-- Tableau -->
        <div class="bg-white rounded-lg border border-border overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-[#f9fafb] border-b border-border">
                  <th
                    v-for="col in columns"
                    :key="col"
                    class="h-11 px-6 text-left text-xs font-medium text-[#475467] whitespace-nowrap"
                    style="font-family: var(--ds-typography-font-family-inter)"
                  >{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredRows"
                  :key="row.id"
                  class="border-b border-border last:border-b-0 hover:bg-[#f9fafb] transition-colors cursor-pointer"
                  @click="detailTarget = row"
                >
                  <td class="h-[52px] px-6 text-sm text-text-secondary whitespace-nowrap">{{ row.niveau }}</td>
                  <td class="h-[52px] px-6">
                    <DsBadge :label="stade(row.stade).label" :color="stade(row.stade).color" variant="pill-color" size="sm" :dot="true" />
                  </td>
                  <td class="h-[52px] px-6 text-sm text-text-secondary whitespace-nowrap">{{ row.culture }}</td>
                  <td class="h-[52px] px-6 text-sm text-text-secondary whitespace-nowrap">{{ row.nomEnqueteur }}</td>
                  <td class="h-[52px] px-6 text-sm text-text-secondary whitespace-nowrap">{{ row.prenomEnqueteur }}</td>
                  <td class="h-[52px] px-6">
                    <div class="flex items-center gap-1">
                      <button class="flex items-center justify-center w-8 h-8 rounded-md text-text-quaternary hover:bg-[#f2f4f7] transition-colors" aria-label="Modifier" @click.stop="editTarget = row">
                        <Pencil :size="16" />
                      </button>
                      <button class="flex items-center justify-center w-8 h-8 rounded-md text-text-quaternary hover:bg-[#fef3f2] hover:text-[#d92d20] transition-colors" aria-label="Supprimer" @click.stop>
                        <Trash2 :size="16" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination : composant Design System -->
          <DsPagination :current-page="currentPage" :total-pages="totalPages" @page-change="currentPage = $event" />
        </div>
      </div>
    </div>

    <!-- Détail d'une réponse (slide-over lecture seule, ouvert au clic sur une ligne) -->
    <ResponseDetailPanel
      v-if="detailTarget"
      :reponse="detailTarget"
      @close="detailTarget = null"
    />

    <!-- Édition d'une réponse (slide-over + confirmation si abandon) -->
    <ResponseEditPanel
      v-if="editTarget"
      :reponse="editTarget"
      @save="onSaveResponse"
      @close="editTarget = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { LayoutGrid, Map, Pencil, Trash2, CircleCheck, Clock } from 'lucide-vue-next'
import Header from '~/components/layout/Header.vue'
import MetricCard from '~/components/ui/MetricCard.vue'
import ResponseEditPanel from '~/components/dataos/ResponseEditPanel.vue'
import ResponseDetailPanel from '~/components/dataos/ResponseDetailPanel.vue'
import { useDataOsStore } from '~/stores/dataos'
import { useToastStore } from '~/stores/toast'
import { useUIStore } from '~/stores/ui'
import { reponsesMock, reponsesStats } from '~/data/dataos'
import type { SuiviStade, SuiviReponse } from '~/data/dataos'

const router  = useRouter()
const store   = useDataOsStore()
const toast   = useToastStore()
const uiStore = useUIStore()

// Données collectées en attente de synchronisation vers KYF (TOLBI ID).
// Alimente le badge de compteur sur le bouton « Synchroniser vers KYF ».
const pendingKyf = computed(() => store.pendingKyfCount)

const metrics = [
  { label: 'Nombre de données',      value: reponsesStats.total.toLocaleString('fr-FR'),   icon: LayoutGrid },
  { label: 'Validés',                value: reponsesStats.valides.toLocaleString('fr-FR'), icon: CircleCheck },
  { label: 'En cours de validation', value: reponsesStats.enCours.toLocaleString('fr-FR'), icon: Clock },
]

const columns = ['Niveau', 'Stade', 'Culture trouvées', 'Nom de l\'enquêteur', 'Prénom de l\'enquêteur', 'Actions']

const currentPage = ref(1)
const totalPages  = 10

const view   = ref<'data' | 'polygones'>('data')
const search = ref('')

// Copie réactive : les modifications de la table persistent dans la session.
const rows = ref<SuiviReponse[]>(reponsesMock.map((r) => ({ ...r })))

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return rows.value
  return rows.value.filter((r) =>
    r.niveau.toLowerCase().includes(q) ||
    r.culture.toLowerCase().includes(q) ||
    r.nomEnqueteur.toLowerCase().includes(q) ||
    r.prenomEnqueteur.toLowerCase().includes(q),
  )
})

// ── Détail d'une réponse (slide-over lecture seule, clic sur une ligne) ──
const detailTarget = ref<SuiviReponse | null>(null)

// ── Édition d'une réponse (slide-over) ──
const editTarget = ref<SuiviReponse | null>(null)

function onSaveResponse(updated: SuiviReponse) {
  const i = rows.value.findIndex((r) => r.id === updated.id)
  if (i !== -1) rows.value[i] = { ...updated }
  toast.show({ title: 'Réponse mise à jour', description: 'Les modifications ont été enregistrées.' })
}

const STADE: Record<SuiviStade, { label: string; color: string }> = {
  'accepte':  { label: 'Accepté',  color: 'success' },
  'en-cours': { label: 'En cours', color: 'warning' },
  'rejete':   { label: 'Rejeté',   color: 'error'   },
}
const stade = (s: SuiviStade) => STADE[s]

// ── Synchronisation vers KYF (TOQ-559) ──
const syncing = ref(false)

function sync() {
  if (syncing.value) return
  // On passe toujours par l'état de chargement — même sans données en attente :
  // le bouton montre qu'une vérification est tentée, puis annonce le résultat
  // (synchronisé, rien à synchroniser, ou échec).
  syncing.value = true
  setTimeout(() => {
    syncing.value = false
    const res = store.syncToKyf()
    if (res.status === 'synced') {
      toast.show({
        title: 'Synchronisation terminée',
        description: `${res.count} producteurs ajoutés à la liste ID.`,
        actions: [{ label: 'Voir dans ID', onClick: goKyf }],
      })
    } else if (res.status === 'nothing') {
      showNothingToSync()
    } else {
      toast.show({ title: 'Synchronisation échouée', description: res.error })
    }
  }, 1500)
}

// Cas « rien à synchroniser » : pas une erreur — les données sont déjà dans KYF.
function showNothingToSync() {
  toast.show({
    title: 'Aucune donnée à synchroniser',
    description: 'Toutes les données collectées sont déjà dans ID.',
    actions: [{ label: 'Voir dans ID', onClick: goKyf }],
  })
}

function goKyf() {
  uiStore.beginTransition()
  router.push('/id/producteurs')
}

function finishCollecte() {
  // TODO : flux de fin de collecte (confirmation + clôture).
}
</script>

<style scoped>
/* Bouton recomposé à l'identique de DsButton (variante secondary-gray, taille md)
   à partir des mêmes tokens du design system, pour héberger le patch trailing. */
.sync-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 14px;
  border: 1px solid var(--ds-semantic-border-primary);
  border-radius: var(--ds-radius-md);
  background: var(--ds-semantic-bg-primary);
  color: var(--ds-semantic-fg-secondary);
  font-family: var(--ds-typography-font-family-poppins);
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25rem;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: var(--ds-shadow-xs);
  transition:
    background-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    color            var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    border-color     var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}
.sync-btn:hover:not(:disabled) { background: var(--ds-semantic-bg-primary-hover); }
.sync-btn:disabled { cursor: default; }

/* Spinner de chargement — repris du DsButton (mêmes dimensions/animation). */
.sync-btn__spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: sync-spin 0.6s linear infinite;
}
@keyframes sync-spin { to { transform: rotate(360deg); } }

/* Patch trailing : révélé en élargissant le bouton (max-width) avec un léger pop,
   sur les tokens de motion du design system. margin-left compense le gap du bouton
   pour ne pas laisser d'espace résiduel une fois le patch retiré. */
.sync-badge {
  display: inline-flex;
  overflow: hidden;
}
.sync-badge-enter-active {
  transition:
    max-width   var(--ds-motion-duration-enter) var(--ds-motion-easing-default),
    opacity     var(--ds-motion-duration-enter) var(--ds-motion-easing-default),
    transform   var(--ds-motion-duration-enter) var(--ds-motion-easing-default),
    margin-left var(--ds-motion-duration-enter) var(--ds-motion-easing-default);
}
.sync-badge-leave-active {
  transition:
    max-width   var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    opacity     var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    transform   var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    margin-left var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}
.sync-badge-enter-from,
.sync-badge-leave-to {
  max-width: 0;
  opacity: 0;
  transform: scale(0.7);
  margin-left: -4px;
}
.sync-badge-enter-to,
.sync-badge-leave-from {
  max-width: 2.5rem;
  opacity: 1;
  transform: scale(1);
  margin-left: 0;
}

@media (prefers-reduced-motion: reduce) {
  .sync-btn,
  .sync-badge-enter-active,
  .sync-badge-leave-active { transition: none; }
}
</style>
