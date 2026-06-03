<template>

  <!-- ── Phase: traitement en cours ─────────────────── -->
  <div v-if="phase === 'processing'" class="flex flex-col flex-1 min-h-0 overflow-hidden">
    <Header title="Fournisseurs">
      <template #actions>
        <DsButton label="Ajouter des fournisseurs" variant="primary" icon-leading="user-plus-01" @click="$emit('add')" />
      </template>
    </Header>

    <div class="flex flex-1 min-h-0 overflow-hidden bg-surface">
      <div class="flex flex-col flex-1 min-h-0 p-6">
        <div class="flex flex-col flex-1 min-h-0 bg-white rounded-lg overflow-hidden">
          <div class="flex-1 flex flex-col items-center justify-center gap-12 min-h-0 px-8">
            <div class="spinner-lg" />
            <p class="text-[18px] font-medium leading-7 text-text-secondary text-center" style="font-family: var(--ds-typography-font-family-inter)">
              Environ 30 secondes — matching vers le modèle Tolbi...
            </p>
          </div>
          <div class="border-t border-[#eaecf0] px-8 py-4 flex items-center justify-between shrink-0">
            <DsButton label="Retour" variant="secondary-gray" @click="$emit('back')" />
            <DsButton label="Continuer" variant="secondary-gray" :disabled="true" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Phase: résultats du traitement ─────────────── -->
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="phase === 'results'" class="fixed inset-0 z-[9990] bg-white flex flex-col overflow-hidden">

        <!-- ── Modal de confirmation d'annulation ── -->
        <Transition name="cancel-modal">
          <div v-if="showCancelModal" class="absolute inset-0 z-10 flex items-center justify-center px-8">
            <div
              class="absolute inset-0 bg-[#0c111d]/70 backdrop-blur-sm"
              @click="showCancelModal = false"
            />
            <div class="relative bg-white rounded-xl w-full max-w-[544px] overflow-hidden shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)]">
              <!-- Header -->
              <div class="flex gap-4 items-start px-6 pt-6">
                <div class="flex items-center justify-center size-12 rounded-full bg-[#fee4e2] shrink-0">
                  <Trash2 :size="24" class="text-[#d92d20]" />
                </div>
                <div class="flex flex-col gap-1 flex-1 min-w-0 pr-8">
                  <p class="text-[18px] font-semibold text-text-primary leading-7">Annuler l'import</p>
                  <p class="text-sm text-text-secondary leading-5">Le traitement en cours sera abandonné. Tes fichiers devront être redéposés pour un nouvel import.</p>
                </div>
              </div>
              <button
                class="absolute top-3 right-3 flex items-center justify-center w-11 h-11 rounded-lg text-text-quaternary hover:bg-surface transition-colors"
                @click="showCancelModal = false"
              >
                <X :size="20" />
              </button>
              <!-- Footer -->
              <div class="flex items-center justify-end gap-3 px-6 pt-8 pb-6">
                <DsButton label="Continuer l'import" variant="secondary-gray" @click="showCancelModal = false" />
                <DsButton label="Annuler l'import" variant="danger" @click="$emit('cancel')" />
              </div>
            </div>
          </div>
        </Transition>

        <div class="flex flex-col flex-1 min-h-0 overflow-hidden">

          <!-- En-tête du panel -->
          <div class="relative flex flex-col shrink-0 px-6 pt-8 pb-0">
            <p class="text-2xl font-semibold text-text-primary leading-8">Détails du traitement</p>
            <button
              class="absolute top-8 right-6 flex items-center justify-center w-10 h-10 rounded-lg text-text-quaternary hover:bg-surface transition-colors"
              @click="showCancelModal = true"
            >
              <X :size="20" />
            </button>
            <div class="mt-5 h-px bg-[#eaecf0]" />
          </div>

          <!-- Bannière de résumé -->
          <div class="flex items-center justify-between mx-6 mt-4 p-4 bg-surface rounded-xl shrink-0">
            <p class="text-base leading-6" style="font-family: var(--ds-typography-font-family-inter)">
              <span class="font-semibold text-text-primary" style="font-family: var(--ds-typography-font-family-poppins)">
                {{ result.totalMatched.toLocaleString('fr-FR') }} fournisseurs
              </span>
              {{ ' ' }}correctement matchés sur {{ result.totalExpected.toLocaleString('fr-FR') }}.
            </p>
            <div
              v-if="hasErrors"
              class="flex items-center gap-3 pl-4 pr-3 py-2 bg-white rounded-full border border-[#d92d20]"
            >
              <AlertTriangle :size="20" class="text-[#d92d20] shrink-0" />
              <span class="text-base font-semibold text-[#d92d20]" style="font-family: var(--ds-typography-font-family-poppins)">Erreurs</span>
              <span class="flex items-center px-2.5 py-0.5 bg-[#fef3f2] border border-[#fecdca] rounded-full text-sm font-medium text-[#b42318]" style="font-family: var(--ds-typography-font-family-inter)">
                {{ errorCount }}
              </span>
            </div>
          </div>

          <!-- Onglets + actions -->
          <div class="flex items-center justify-between px-6 mt-3 shrink-0 gap-4">
            <!-- Tabs -->
            <div class="flex items-center gap-1 p-1 bg-[#f9fafb] border border-[#eaecf0] rounded-[10px]">
              <button
                class="flex items-center gap-2 h-9 px-3 rounded-md text-sm font-semibold transition-all"
                :class="activeTab === 'concordance'
                  ? 'bg-white shadow-[0px_1px_3px_rgba(16,24,40,0.1),0px_1px_2px_rgba(16,24,40,0.06)] text-text-secondary'
                  : 'text-text-quaternary'"
                style="font-family: var(--ds-typography-font-family-poppins)"
                @click="activeTab = 'concordance'"
              >
                <LayoutGrid :size="18" />
                Concordance des colonnes
                <span
                  v-if="hasErrors"
                  class="flex items-center px-2 py-0.5 bg-[#fef3f2] border border-[#fecdca] rounded-full text-xs font-medium text-[#b42318]"
                  style="font-family: var(--ds-typography-font-family-inter)"
                >{{ errorCount }}</span>
              </button>

              <div class="h-5 w-px bg-[#eaecf0] mx-0.5" />

              <button
                class="flex items-center gap-2 h-9 px-3 rounded-md text-sm font-semibold text-text-quaternary transition-all"
                :class="activeTab === 'geo' ? 'bg-white shadow-[0px_1px_3px_rgba(16,24,40,0.1)] text-text-secondary' : ''"
                style="font-family: var(--ds-typography-font-family-poppins)"
                @click="activeTab = 'geo'"
              >
                <Map :size="16" />
                Fichier géographique
              </button>

              <div class="h-5 w-px bg-[#eaecf0] mx-0.5" />

              <button
                class="flex items-center gap-2 h-9 px-3 rounded-md text-sm font-semibold text-text-quaternary transition-all"
                :class="activeTab === 'excel' ? 'bg-white shadow-[0px_1px_3px_rgba(16,24,40,0.1)] text-text-secondary' : ''"
                style="font-family: var(--ds-typography-font-family-poppins)"
                @click="activeTab = 'excel'"
              >
                <FileSpreadsheet :size="16" />
                Fichier Excel
              </button>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 shrink-0">
              <DsButton label="Voir toutes les colonnes" variant="secondary-gray" icon-trailing="chevron-down" />
              <DsButton label="Exporter sous format Excel" variant="secondary-gray" icon-trailing="chevron-down" />
            </div>
          </div>

          <!-- Tableau de concordance -->
          <div class="flex flex-1 min-h-0 overflow-auto px-6 mt-3">
            <div class="flex w-full border border-[#eaecf0] rounded-2xl overflow-hidden">

              <!-- Colonne gauche: Vos colonnes -->
              <div class="flex-1 flex flex-col border-r border-[#eaecf0] min-w-0">
                <div class="flex items-center h-16 px-6 bg-[#f9fafb] border-b border-[#eaecf0] shrink-0">
                  <span class="text-sm font-medium text-text-tertiary" style="font-family: var(--ds-typography-font-family-inter)">Vos colonnes</span>
                </div>
                <div
                  v-for="(col, i) in result.columns"
                  :key="`left-${i}`"
                  class="flex items-center h-16 px-6 border-b border-[#eaecf0] last:border-b-0"
                  :class="col.yourColumn === null ? 'bg-[#fef3f2]' : ''"
                >
                  <template v-if="col.yourColumn === null">
                    <div class="flex items-center justify-center size-10 rounded-full bg-[#fee4e2] shrink-0">
                      <AlertTriangle :size="20" class="text-[#d92d20]" />
                    </div>
                    <span class="ml-2 text-sm italic text-text-tertiary" style="font-family: var(--ds-typography-font-family-inter)">
                      Colonne attendue manquante
                    </span>
                  </template>
                  <span v-else class="text-sm font-medium text-text-primary" style="font-family: var(--ds-typography-font-family-inter)">
                    {{ col.yourColumn }}
                  </span>
                </div>
              </div>

              <!-- Colonne droite: Colonnes Tolbi -->
              <div class="flex-1 flex flex-col min-w-0">
                <div class="flex items-center h-16 px-6 bg-[#f9fafb] border-b border-[#eaecf0] shrink-0">
                  <span class="text-sm font-medium text-text-tertiary" style="font-family: var(--ds-typography-font-family-inter)">Colonnes Tolbi</span>
                </div>
                <div
                  v-for="(col, i) in result.columns"
                  :key="`right-${i}`"
                  class="flex items-center h-16 px-6 border-b border-[#eaecf0] last:border-b-0"
                  :class="col.yourColumn === null ? 'bg-[#fef3f2]' : ''"
                >
                  <span class="text-sm font-medium text-text-primary" style="font-family: var(--ds-typography-font-family-inter)">
                    {{ col.tolbiColumn }}
                  </span>
                </div>
              </div>

            </div>
          </div>

          <!-- Stats -->
          <div class="flex items-center gap-4 px-6 py-3 shrink-0">
            <div class="bg-[#f9fafb] p-2 rounded-2xl">
              <div class="flex flex-col gap-1 px-4 py-2 bg-[#f2f4f7] rounded-xl w-[217px]">
                <span class="text-sm font-medium text-text-secondary" style="font-family: var(--ds-typography-font-family-inter)">Surface calculée</span>
                <span class="text-sm font-semibold text-text-primary" style="font-family: var(--ds-typography-font-family-poppins)">{{ result.surfaceHa }} ha</span>
              </div>
            </div>
            <div class="bg-[#f9fafb] p-2 rounded-2xl">
              <div class="flex flex-col gap-1 px-4 py-2 bg-[#f2f4f7] rounded-xl w-[217px]">
                <span class="text-sm font-medium text-text-secondary" style="font-family: var(--ds-typography-font-family-inter)">Fournisseurs répertoriés</span>
                <span class="text-sm font-semibold text-text-primary" style="font-family: var(--ds-typography-font-family-poppins)">{{ result.totalMatched.toLocaleString('fr-FR') }}</span>
              </div>
            </div>
          </div>

          <!-- Barre du bas -->
          <div class="flex flex-col gap-4 px-6 py-4 shrink-0">
            <div class="h-px bg-[#eaecf0]" />
            <div class="flex items-center justify-between">
              <DsButton label="Annuler l'import" variant="secondary-gray" @click="showCancelModal = true" />
              <div class="flex items-center gap-3">
                <DsButton label="Refaire le traitement" variant="secondary-gray" />
                <DsButton
                  label="Finaliser l'import"
                  :variant="hasErrors ? 'secondary-gray' : 'primary'"
                  :disabled="hasErrors"
                />
              </div>
            </div>
          </div>

      </div>
    </div>
    </Transition>
  </Teleport>

</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { AlertTriangle, X, LayoutGrid, Map, FileSpreadsheet, Trash2 } from 'lucide-vue-next'
import { useScenarioStore } from '~/stores/scenario'
import type { MatchingResult } from '~/types/scenario'

defineEmits<{ back: []; next: []; add: []; cancel: [] }>()

const scenario = useScenarioStore()

type Phase = 'processing' | 'results'
type Tab   = 'concordance' | 'geo' | 'excel'

const phase          = ref<Phase>('processing')
const activeTab      = ref<Tab>('concordance')
const showCancelModal = ref(false)
let timer: ReturnType<typeof setTimeout>

const DEFAULT_RESULT: MatchingResult = {
  totalMatched:  2400,
  totalExpected: 2400,
  surfaceHa:     537,
  columns: [
    { yourColumn: 'code_nat_producteur',              tolbiColumn: 'CODE NAT PRODUCTEUR' },
    { yourColumn: 'code_coop',                        tolbiColumn: 'CODE COOP PRODUCTEUR' },
    { yourColumn: 'code_producteur',                  tolbiColumn: 'CODE PRODUCTEUR PARTENAIRE' },
    { yourColumn: 'nom_et_prénom',                    tolbiColumn: 'NOM ET PRENOM' },
    { yourColumn: 'genre',                            tolbiColumn: 'GENRE' },
    { yourColumn: 'age',                              tolbiColumn: 'AGE' },
    { yourColumn: 'préfecture',                       tolbiColumn: 'PREFECTURE' },
    { yourColumn: 'sous_préfecture',                  tolbiColumn: 'SOUS PREFECTURE' },
    { yourColumn: 'sections',                         tolbiColumn: 'SECTIONS' },
    { yourColumn: 'localités',                        tolbiColumn: 'LOCALITES' },
    { yourColumn: 'villages',                         tolbiColumn: 'VILLAGES' },
    { yourColumn: 'cni',                              tolbiColumn: 'PIECES IDENTITEES CNI/AUTRES' },
    { yourColumn: 'téléphone',                        tolbiColumn: 'TELEPHONE PRODUCTEUR' },
    { yourColumn: 'cultures_pratiquées',              tolbiColumn: 'CULTURES PRATIQUEES' },
    { yourColumn: "superficie_de_l'exploitation",     tolbiColumn: "SURPERFICIE DE L'EXPLOITATION" },
  ],
}

// Le scénario actif détermine le résultat affiché — la navigation reste naturelle
const result = computed<MatchingResult>(() =>
  scenario.fournisseurs?.matchingResult ?? DEFAULT_RESULT,
)

const errorCount = computed(() =>
  result.value.columns.filter(c => c.yourColumn === null).length,
)

const hasErrors = computed(() => errorCount.value > 0)

onMounted(() => {
  timer = setTimeout(() => { phase.value = 'results' }, 4000)
})

onUnmounted(() => clearTimeout(timer))
</script>

<style scoped>
/* ── Cancel modal ── */
.cancel-modal-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.cancel-modal-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.cancel-modal-enter-from,
.cancel-modal-leave-to { opacity: 0; transform: scale(0.97); }

/* ── Sheet slide-up ── */
.sheet-enter-active {
  transition: transform 0.42s cubic-bezier(0.16, 1, 0.3, 1);
}
.sheet-leave-active {
  transition: transform 0.28s cubic-bezier(0.4, 0, 1, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(100%);
}

.spinner-lg {
  width: 64px;
  height: 64px;
  border: 4px solid #eaecf0;
  border-top-color: var(--ds-semantic-fg-brand-primary, #056033);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
