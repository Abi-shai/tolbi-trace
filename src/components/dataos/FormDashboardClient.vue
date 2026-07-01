<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden bg-surface content-arrive">

    <Header title="Suivi des réponses">
      <template #actions>
        <DsButton label="Synchroniser vers KYF" variant="secondary-gray" icon-leading="refresh-ccw-01" :loading="syncing" @click="sync" />
        <DsButton label="Terminer la collecte" variant="danger" @click="finishCollecte" />
      </template>
    </Header>

    <div class="flex-1 overflow-y-auto">
      <div class="flex flex-col gap-6 p-6">

        <!-- Métriques -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            v-for="m in metrics"
            :key="m.label"
            class="flex flex-col gap-1 justify-center bg-white border border-[#f2f4f7] rounded-md px-4 py-2 min-h-[76px]"
          >
            <p class="text-base text-text-secondary leading-6 tracking-[-0.16px]">{{ m.label }}</p>
            <p class="text-2xl font-bold text-[#056033] leading-8 tracking-[-0.24px]">{{ m.value }}</p>
          </div>
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
                  class="border-b border-border last:border-b-0 hover:bg-[#f9fafb] transition-colors"
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
                      <button class="flex items-center justify-center w-8 h-8 rounded-md text-text-quaternary hover:bg-[#f2f4f7] transition-colors" aria-label="Modifier" @click="editTarget = row">
                        <Pencil :size="16" />
                      </button>
                      <button class="flex items-center justify-center w-8 h-8 rounded-md text-text-quaternary hover:bg-[#fef3f2] hover:text-[#d92d20] transition-colors" aria-label="Supprimer">
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
import { LayoutGrid, Map, Pencil, Trash2 } from 'lucide-vue-next'
import Header from '~/components/layout/Header.vue'
import ResponseEditPanel from '~/components/dataos/ResponseEditPanel.vue'
import { useDataOsStore } from '~/stores/dataos'
import { useToastStore } from '~/stores/toast'
import { useUIStore } from '~/stores/ui'
import { reponsesMock, reponsesStats } from '~/data/dataos'
import type { SuiviStade, SuiviReponse } from '~/data/dataos'

const router  = useRouter()
const store   = useDataOsStore()
const toast   = useToastStore()
const uiStore = useUIStore()

const metrics = [
  { label: 'Nombre de données',     value: reponsesStats.total.toLocaleString('fr-FR') },
  { label: 'Validés',               value: reponsesStats.valides.toLocaleString('fr-FR') },
  { label: 'En cours de validation', value: reponsesStats.enCours.toLocaleString('fr-FR') },
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
  syncing.value = true
  setTimeout(() => {
    syncing.value = false
    const res = store.syncToKyf()
    if (res.ok) {
      toast.show({
        title: 'Synchronisation terminée',
        description: `${res.count} producteurs ajoutés à la liste KYF.`,
        actions: [{ label: 'Voir dans KYF', onClick: goKyf }],
      })
    } else {
      toast.show({ title: 'Synchronisation échouée', description: res.error })
    }
  }, 1500)
}

function goKyf() {
  uiStore.beginTransition()
  router.push('/id/producteurs')
}

function finishCollecte() {
  // TODO : flux de fin de collecte (confirmation + clôture).
}
</script>
