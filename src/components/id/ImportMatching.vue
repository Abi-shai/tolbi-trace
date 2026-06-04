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

        <!-- ── Modal de confirmation — Refaire le traitement ── -->
        <Transition name="cancel-modal">
          <div v-if="showRetryModal" class="absolute inset-0 z-50 flex items-center justify-center px-8">
            <div class="absolute inset-0 bg-[#0c111d]/70 backdrop-blur-sm" @click="showRetryModal = false" />
            <div class="relative bg-white rounded-xl w-full max-w-[520px] overflow-hidden shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)]">
              <!-- Header -->
              <div class="flex flex-col gap-1 px-6 pt-6 pb-5">
                <p class="text-[18px] font-semibold text-text-primary leading-7" style="font-family: var(--ds-typography-font-family-poppins)">Refaire le traitement</p>
                <p class="text-sm text-text-tertiary leading-5" style="font-family: var(--ds-typography-font-family-poppins)">Précisez ce qui doit être corrigé avant de relancer le traitement.</p>
              </div>
              <button
                class="absolute top-3 right-3 flex items-center justify-center w-11 h-11 rounded-lg text-text-quaternary hover:bg-surface transition-colors"
                @click="showRetryModal = false"
              >
                <X :size="24" />
              </button>
              <!-- Content -->
              <div class="px-6 pb-2">
                <DsTextareaField
                  v-model="retryMotif"
                  label="Motif (facultatif)"
                  placeholder="Ex : fichier mis à jour, correction d'identifiants producteurs, données manquantes..."
                />
              </div>
              <!-- Footer -->
              <div class="flex items-center justify-end gap-3 px-6 pt-4 pb-6 border-t border-[#eaecf0] mt-4">
                <DsButton label="Annuler" variant="secondary-gray" @click="showRetryModal = false" />
                <DsButton label="Refaire le traitement" variant="primary" @click="onRetry" />
              </div>
            </div>
          </div>
        </Transition>

        <!-- ── Modal de confirmation — Finaliser l'import ── -->
        <Transition name="cancel-modal">
          <div v-if="showFinalizeModal" class="absolute inset-0 z-50 flex items-center justify-center px-8">
            <div class="absolute inset-0 bg-[#0c111d]/70 backdrop-blur-sm" @click="showFinalizeModal = false" />
            <div class="relative bg-white rounded-xl w-full max-w-[544px] overflow-hidden shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)]">
              <!-- Header -->
              <div class="px-6 pt-6">
                <p class="text-[18px] font-semibold text-text-primary leading-7" style="font-family: var(--ds-typography-font-family-poppins)">Finaliser l'import</p>
                <p class="mt-1 text-sm text-text-secondary leading-5" style="font-family: var(--ds-typography-font-family-poppins)">
                  {{ totalMatched.toLocaleString('fr-FR') }} fournisseurs seront ajoutés à votre base KYF. Cette action est irréversible.
                </p>
              </div>
              <button
                class="absolute top-3 right-3 flex items-center justify-center w-11 h-11 rounded-lg text-text-quaternary hover:bg-surface transition-colors"
                @click="showFinalizeModal = false"
              >
                <X :size="24" />
              </button>
              <!-- Footer -->
              <div class="flex items-center justify-end gap-3 px-6 pt-8 pb-6">
                <DsButton label="Annuler" variant="secondary-gray" @click="showFinalizeModal = false" />
                <DsButton label="Finaliser l'import" variant="primary" @click="onFinalize" />
              </div>
            </div>
          </div>
        </Transition>

        <!-- ── Modal de confirmation — Finaliser malgré les avertissements ── -->
        <Transition name="cancel-modal">
          <div v-if="showFinalizeWarningsModal" class="absolute inset-0 z-50 flex items-center justify-center px-8">
            <div class="absolute inset-0 bg-[#0c111d]/70 backdrop-blur-sm" @click="showFinalizeWarningsModal = false" />
            <div class="relative bg-white rounded-xl w-full max-w-[544px] overflow-hidden shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)]">
              <!-- Header -->
              <div class="flex gap-4 items-start px-6 pt-6">
                <div class="flex items-center justify-center size-12 rounded-full bg-[#fef0c7] shrink-0">
                  <AlertTriangle :size="24" class="text-[#f79009]" />
                </div>
                <div class="flex flex-col gap-1 flex-1 min-w-0 pr-8">
                  <p class="text-[18px] font-semibold text-text-primary leading-7" style="font-family: var(--ds-typography-font-family-poppins)">Finaliser malgré les avertissements</p>
                  <p class="text-sm text-text-secondary leading-5" style="font-family: var(--ds-typography-font-family-poppins)">
                    {{ warningCount }} avertissement{{ warningCount > 1 ? 's' : '' }} non résolu{{ warningCount > 1 ? 's' : '' }} seront ignorés. Ces données seront importées telles quelles et pourront être corrigées manuellement ensuite.
                  </p>
                </div>
              </div>
              <button
                class="absolute top-3 right-3 flex items-center justify-center w-11 h-11 rounded-lg text-text-quaternary hover:bg-surface transition-colors"
                @click="showFinalizeWarningsModal = false"
              >
                <X :size="24" />
              </button>
              <!-- Footer -->
              <div class="flex items-center justify-end gap-3 px-6 pt-8 pb-6">
                <DsButton label="Annuler" variant="secondary-gray" @click="showFinalizeWarningsModal = false" />
                <DsButton label="Finaliser quand même" variant="primary" @click="onFinalize" />
              </div>
            </div>
          </div>
        </Transition>

        <!-- ── Modal de confirmation d'annulation ── -->
        <Transition name="cancel-modal">
          <div v-if="showCancelModal" class="absolute inset-0 z-50 flex items-center justify-center px-8">
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
          <div v-if="!isProcessingError && !isRetrying" class="flex items-center justify-between mx-6 mt-4 p-4 bg-surface rounded-xl shrink-0">
            <p class="text-base leading-6" style="font-family: var(--ds-typography-font-family-inter)">
              <span class="font-semibold text-text-primary" style="font-family: var(--ds-typography-font-family-poppins)">
                {{ totalMatched.toLocaleString('fr-FR') }} fournisseurs
              </span>
              {{ ' ' }}correctement matchés sur {{ totalExpected.toLocaleString('fr-FR') }}.
            </p>
            <div class="flex items-center gap-2">
              <div
                v-if="informationCount > 0"
                class="flex items-center gap-3 pl-4 pr-3 py-2 bg-white rounded-full border border-[#17b26a]"
              >
                <Info :size="20" class="text-[#079455] shrink-0" />
                <span class="text-base font-semibold text-[#079455]" style="font-family: var(--ds-typography-font-family-poppins)">Informations</span>
                <span class="flex items-center px-2.5 py-0.5 bg-[#ecfdf3] border border-[#abefc6] rounded-full text-sm font-medium text-[#067647]" style="font-family: var(--ds-typography-font-family-inter)">{{ informationCount }}</span>
              </div>
              <div
                v-if="hasErrors"
                class="flex items-center gap-3 pl-4 pr-3 py-2 bg-white rounded-full border border-[#d92d20]"
              >
                <AlertTriangle :size="20" class="text-[#d92d20] shrink-0" />
                <span class="text-base font-semibold text-[#d92d20]" style="font-family: var(--ds-typography-font-family-poppins)">Erreurs</span>
                <span class="flex items-center px-2.5 py-0.5 bg-[#fef3f2] border border-[#fecdca] rounded-full text-sm font-medium text-[#b42318]" style="font-family: var(--ds-typography-font-family-inter)">{{ errorCount }}</span>
              </div>
              <div
                v-if="hasWarnings"
                class="flex items-center gap-3 pl-4 pr-3 py-2 bg-white rounded-full border border-[#f79009]"
              >
                <AlertTriangle :size="20" class="text-[#f79009] shrink-0" />
                <span class="text-base font-semibold text-[#b54708]" style="font-family: var(--ds-typography-font-family-poppins)">Avertissements</span>
                <span class="flex items-center px-2.5 py-0.5 bg-[#fffaeb] border border-[#fedf89] rounded-full text-sm font-medium text-[#b54708]" style="font-family: var(--ds-typography-font-family-inter)">{{ warningCount }}</span>
              </div>
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
                <Table2 :size="20" />
                Concordance des colonnes
                <span
                  v-if="columnErrorCount > 0"
                  class="flex items-center px-2 py-0.5 bg-[#fef3f2] border border-[#fecdca] rounded-full text-xs font-medium text-[#b42318]"
                  style="font-family: var(--ds-typography-font-family-inter)"
                >{{ columnErrorCount }}</span>
              </button>

              <div
                class="flex items-center h-9 rounded-md transition-all overflow-hidden"
                :class="activeTab === 'fichiers' ? 'bg-white shadow-[0px_1px_3px_rgba(16,24,40,0.1),0px_1px_2px_rgba(16,24,40,0.06)]' : ''"
              >
                <button
                  class="flex items-center gap-2 h-full px-3 text-sm font-semibold transition-colors"
                  :class="activeTab === 'fichiers' ? 'text-text-secondary' : 'text-text-quaternary'"
                  style="font-family: var(--ds-typography-font-family-poppins)"
                  @click="activeTab = 'fichiers'"
                >
                  <svg width="14" height="12" viewBox="0 0 13.2 12" fill="none" xmlns="http://www.w3.org/2000/svg" class="shrink-0">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 8.4H13.2V12H9.6V10.8H3.6V12H0V8.4H1.2V3.6H0V0H3.6V1.2H9.6V0H13.2V3.6H12V8.4ZM9.6 3.6V2.4H3.6V3.6H2.4V8.4H3.6V9.6H9.6V8.4H10.8V3.6H9.6ZM1.2 10.8H2.4V9.6H1.2V10.8ZM10.8 10.8H12V9.6H10.8V10.8ZM1.2 2.4H2.4V1.2H1.2V2.4ZM10.8 2.4H12V1.2H10.8V2.4Z" fill="#4E5BA6"/>
                  </svg>
                  Fichier géographique
                  <span
                    v-if="rowErrorCount > 0"
                    class="flex items-center px-2 py-0.5 bg-[#fef3f2] border border-[#fecdca] rounded-full text-xs font-medium text-[#b42318]"
                    style="font-family: var(--ds-typography-font-family-inter)"
                  >{{ rowErrorCount }}</span>
                </button>

                <div class="h-5 w-px bg-[#eaecf0]" />

                <button
                  class="flex items-center gap-2 h-full px-3 text-sm font-semibold transition-colors"
                  :class="activeTab === 'fichiers' ? 'text-text-secondary' : 'text-text-quaternary'"
                  style="font-family: var(--ds-typography-font-family-poppins)"
                  @click="activeTab = 'fichiers'"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="shrink-0">
                    <path d="M0.9 9.9H17.1M0.9 9.9V6.3C0.9 5.30589 1.70589 4.5 2.7 4.5H6.3M0.9 9.9V13.5C0.9 14.4941 1.70589 15.3 2.7 15.3H6.3M17.1 9.9V13.5C17.1 14.4941 16.2941 15.3 15.3 15.3H6.3M17.1 9.9V6.3C17.1 5.30589 16.2941 4.5 15.3 4.5H6.3M6.3 4.5V15.3" stroke="#079455" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Fichier Excel
                  <span
                    v-if="rowResult?.warningCount"
                    class="flex items-center px-2 py-0.5 bg-[#fffaeb] border border-[#fedf89] rounded-full text-xs font-medium text-[#b54708]"
                    style="font-family: var(--ds-typography-font-family-inter)"
                  >{{ rowResult.warningCount }}</span>
                </button>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 shrink-0">

              <!-- Dropdown: Voir toutes les colonnes -->
              <div ref="columnsDropdownRef" class="relative">
                <button
                  class="flex items-center gap-1 px-[14px] py-[10px] bg-white border border-[#d0d5dd] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] text-sm font-semibold text-[#344054] transition-colors hover:bg-[#f9fafb]"
                  style="font-family: var(--ds-typography-font-family-poppins)"
                  @click="showColumnsDropdown = !showColumnsDropdown"
                >
                  {{ activeTab === 'concordance' ? 'Voir toutes les colonnes' : 'Voir toutes les lignes' }}
                  <ChevronDown :size="16" class="text-[#667085] transition-transform" :class="showColumnsDropdown ? 'rotate-180' : ''" />
                </button>
                <Transition name="dropdown">
                  <div
                    v-if="showColumnsDropdown"
                    class="absolute right-0 top-full mt-1 z-50 bg-white border border-[#eaecf0] rounded-lg shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)] min-w-[220px] py-1 overflow-hidden"
                  >
                    <p class="px-4 py-2 text-xs font-medium text-text-tertiary uppercase tracking-wide" style="font-family: var(--ds-typography-font-family-inter)">Colonnes visibles</p>
                    <div
                      v-for="col in result.columns"
                      :key="col.tolbiColumn"
                      class="flex items-center gap-3 px-4 py-2 hover:bg-[#f9fafb] cursor-pointer"
                    >
                      <input type="checkbox" checked class="rounded accent-[#1D9E75] cursor-pointer" :id="`col-${col.tolbiColumn}`" />
                      <label :for="`col-${col.tolbiColumn}`" class="text-sm text-text-secondary cursor-pointer" style="font-family: var(--ds-typography-font-family-inter)">
                        {{ col.tolbiColumn }}
                      </label>
                    </div>
                  </div>
                </Transition>
              </div>

              <!-- Dropdown: Exporter sous format Excel -->
              <div ref="exportDropdownRef" class="relative">
                <button
                  class="flex items-center gap-1 px-[14px] py-[10px] bg-white border border-[#d0d5dd] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] text-sm font-semibold transition-colors"
                  :class="isProcessingError ? 'text-[#98a2b3] cursor-not-allowed' : 'text-[#344054] hover:bg-[#f9fafb]'"
                  style="font-family: var(--ds-typography-font-family-poppins)"
                  :disabled="isProcessingError"
                  @click="!isProcessingError && (showExportDropdown = !showExportDropdown)"
                >
                  Exporter sous format Excel
                  <ChevronDown :size="16" class="transition-transform" :class="[isProcessingError ? 'text-[#98a2b3]' : 'text-[#667085]', showExportDropdown ? 'rotate-180' : '']" />
                </button>
                <Transition name="dropdown">
                  <div
                    v-if="showExportDropdown"
                    class="absolute right-0 top-full mt-1 z-50 bg-white border border-[#eaecf0] rounded-lg shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)] min-w-[220px] py-1 overflow-hidden"
                  >
                    <button class="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-text-secondary hover:bg-[#f9fafb] text-left" style="font-family: var(--ds-typography-font-family-inter)">
                      <FileDown :size="16" class="text-text-tertiary shrink-0" />
                      Exporter la concordance
                    </button>
                    <button class="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-text-secondary hover:bg-[#f9fafb] text-left" style="font-family: var(--ds-typography-font-family-inter)">
                      <FileDown :size="16" class="text-text-tertiary shrink-0" />
                      Exporter toutes les données
                    </button>
                  </div>
                </Transition>
              </div>

            </div>
          </div>

          <!-- Loading interne — Refaire le traitement -->
          <div v-if="isRetrying" class="flex-1 min-h-0 mx-6 mt-3 bg-white border border-[#eaecf0] rounded-2xl flex flex-col items-center justify-center gap-12">
            <div class="spinner-lg" />
            <p class="text-[18px] font-medium leading-7 text-text-secondary text-center" style="font-family: var(--ds-typography-font-family-inter)">
              Environ 30 secondes — matching vers le modèle Tolbi...
            </p>
          </div>

          <!-- État d'erreur de traitement -->
          <div v-else-if="isProcessingError" class="flex-1 min-h-0 mx-6 mt-3 bg-white border border-[#eaecf0] rounded-2xl flex items-center justify-center">
            <div class="flex flex-col items-center gap-6">
              <div class="relative size-12 rounded-full bg-[#fef0c7] shrink-0">
                <div class="absolute left-3 top-3 size-6 overflow-clip">
                  <img alt="" class="block size-full" :src="iconDataProcessing" />
                </div>
              </div>
              <div class="flex flex-col gap-1 items-center text-center max-w-[352px]">
                <p class="text-base font-semibold text-text-primary" style="font-family: var(--ds-typography-font-family-poppins)">Erreur lors du traitement de vos données</p>
                <p class="text-sm text-text-tertiary" style="font-family: var(--ds-typography-font-family-poppins)">Une erreur inattendue est survenue lors de l'analyse de vos données. Le processus a été interrompu.</p>
              </div>
              <DsButton label="Refaire le traitement" variant="secondary-gray" @click="showRetryModal = true" />
            </div>
          </div>

          <!-- Tableau de concordance — mapping colonnes -->
          <ScrollArea v-else-if="activeTab === 'concordance'" class="flex-1 min-h-0 mx-6 mt-3 bg-white border border-[#eaecf0] rounded-2xl">
            <div class="flex items-start w-full">
              <div class="flex-1 flex flex-col min-w-0 border-r border-[#eaecf0]">
                <div class="sticky top-0 z-10 flex items-center h-16 px-6 py-3 bg-[#f9fafb] border-b border-[#eaecf0] shrink-0 w-full">
                  <span class="text-sm font-medium text-[#475467] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">Vos colonnes</span>
                </div>
                <div
                  v-for="(col, i) in result.columns" :key="`left-${i}`"
                  class="flex items-center gap-3 h-16 px-6 py-3 border-b border-[#eaecf0] last:border-b-0 w-full shrink-0"
                  :class="col.yourColumn === null ? 'bg-[#fef3f2]' : col.isNewEntry ? 'bg-[#ecfdf3]' : 'bg-white'"
                >
                  <div v-if="col.yourColumn === null" class="flex items-center gap-2 shrink-0">
                    <div class="flex items-center justify-center size-10 rounded-full bg-[#fee4e2] shrink-0">
                      <AlertTriangle :size="20" class="text-[#d92d20]" />
                    </div>
                    <p class="text-sm italic text-[#475467] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-poppins)">Colonne attendue manquante</p>
                  </div>
                  <p v-else class="text-sm font-medium text-[#101828] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">{{ col.yourColumn }}</p>
                </div>
              </div>
              <div class="flex-1 flex flex-col min-w-0">
                <div class="sticky top-0 z-10 flex items-center h-16 px-6 py-3 bg-[#f9fafb] border-b border-[#eaecf0] shrink-0 w-full">
                  <span class="flex-1 min-w-0 text-sm font-medium text-[#475467] truncate" style="font-family: var(--ds-typography-font-family-inter)">Colonnes Tolbi</span>
                </div>
                <div
                  v-for="(col, i) in result.columns" :key="`right-${i}`"
                  class="flex items-center gap-3 h-16 px-6 py-3 border-b border-[#eaecf0] last:border-b-0 w-full shrink-0"
                  :class="col.yourColumn === null ? 'bg-[#fef3f2]' : col.isNewEntry ? 'bg-[#ecfdf3]' : 'bg-white'"
                >
                  <div v-if="col.isNewEntry" class="flex items-center gap-1 border-[1.5px] border-[#079455] rounded-full pl-1.5 pr-2 py-0.5 shrink-0">
                    <Plus :size="12" class="text-[#067647]" />
                    <span class="text-xs font-medium text-[#067647] leading-[18px]" style="font-family: var(--ds-typography-font-family-inter)">Nouvelle entrée</span>
                  </div>
                  <p v-else class="text-sm font-medium text-[#101828] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">{{ col.tolbiColumn }}</p>
                </div>
              </div>
            </div>
          </ScrollArea>

          <!-- Tableaux données ligne par ligne — deux tables indépendantes -->
          <div v-else-if="activeTab === 'fichiers' && rowResult" class="flex gap-3 flex-1 min-h-0 overflow-hidden mx-6 mt-3">

            <!-- Table Fichier géographique -->
            <ScrollArea class="flex-1 min-w-0 border border-[#eaecf0] rounded-2xl">
              <table class="border-collapse" style="min-width: max-content; width: 100%">
                <thead class="sticky top-0 z-10">
                  <tr>
                    <th
                      v-for="col in rowResult.geoColumns" :key="`geo-h-${col}`"
                      class="h-14 px-4 py-3 bg-[#f9fafb] border-b border-[#eaecf0] text-left text-sm font-medium text-[#475467] whitespace-nowrap"
                      style="font-family: var(--ds-typography-font-family-inter)"
                    >{{ col }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in rowResult.rows" :key="`geo-row-${row.index}`"
                    class="border-b border-[#eaecf0] last:border-b-0"
                    :class="row.geoCells.some(c => c.hasError) ? 'bg-[#fef3f2]' : 'bg-white'"
                  >
                    <td
                      v-for="(cell, ci) in row.geoCells" :key="`geo-${row.index}-${ci}`"
                      class="h-16 px-4 py-3 whitespace-nowrap text-sm"
                      style="font-family: var(--ds-typography-font-family-inter)"
                    >
                      <div v-if="cell.hasError" class="flex items-center gap-2">
                        <AlertTriangle :size="14" class="text-[#d92d20] shrink-0" />
                        <span class="font-medium text-[#101828]">{{ cell.value }}</span>
                      </div>
                      <span v-else class="font-medium text-[#101828]">{{ cell.value }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </ScrollArea>

            <!-- Table Fichier Excel -->
            <ScrollArea class="flex-1 min-w-0 border border-[#eaecf0] rounded-2xl">
              <table class="border-collapse" style="min-width: max-content; width: 100%">
                <thead class="sticky top-0 z-10">
                  <tr>
                    <th
                      v-for="col in rowResult.excelColumns" :key="`xls-h-${col}`"
                      class="h-14 px-4 py-3 bg-[#f9fafb] border-b border-[#eaecf0] text-left text-sm font-medium text-[#475467] whitespace-nowrap"
                      style="font-family: var(--ds-typography-font-family-inter)"
                    >{{ col }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in rowResult.rows" :key="`xls-row-${row.index}`"
                    class="border-b border-[#eaecf0] last:border-b-0"
                    :class="row.excelCells.some(c => c.hasWarning) ? 'bg-[#fffaeb]' : 'bg-white'"
                  >
                    <td
                      v-for="(cell, ci) in row.excelCells" :key="`xls-${row.index}-${ci}`"
                      class="h-16 px-4 py-3 whitespace-nowrap text-sm"
                      style="font-family: var(--ds-typography-font-family-inter)"
                    >
                      <div v-if="cell.hasWarning" class="flex items-center gap-2">
                        <AlertTriangle :size="14" class="text-[#f79009] shrink-0" />
                        <span class="italic text-[#475467]">{{ cell.value }}</span>
                      </div>
                      <span v-else :class="ci === 0 ? 'font-semibold text-[#101828]' : 'font-medium text-[#101828]'">{{ cell.value }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </ScrollArea>

          </div>

          <!-- Stats -->
          <div v-if="!isProcessingError && !isRetrying" class="flex items-center gap-4 px-6 py-3 shrink-0">
            <div class="bg-[#f9fafb] p-2 rounded-2xl">
              <div class="flex flex-col gap-1 px-4 py-2 bg-[#f2f4f7] rounded-xl w-[217px]">
                <span class="text-sm font-medium text-text-secondary" style="font-family: var(--ds-typography-font-family-inter)">Surface calculée</span>
                <span class="text-sm font-semibold text-text-primary" style="font-family: var(--ds-typography-font-family-poppins)">{{ (rowResult?.surfaceHa ?? result.surfaceHa) }} ha</span>
              </div>
            </div>
            <div class="bg-[#f9fafb] p-2 rounded-2xl">
              <div class="flex flex-col gap-1 px-4 py-2 bg-[#f2f4f7] rounded-xl w-[217px]">
                <span class="text-sm font-medium text-text-secondary" style="font-family: var(--ds-typography-font-family-inter)">Fournisseurs répertoriés</span>
                <span class="text-sm font-semibold text-text-primary" style="font-family: var(--ds-typography-font-family-poppins)">{{ totalMatched.toLocaleString('fr-FR') }}</span>
              </div>
            </div>
          </div>

          <!-- Barre du bas -->
          <div class="flex flex-col gap-4 px-6 py-4 shrink-0">
            <div class="h-px bg-[#eaecf0]" />
            <div class="flex items-center justify-between">
              <DsButton label="Annuler l'import" variant="secondary-gray" @click="showCancelModal = true" />
              <div class="flex items-center gap-3">
                <DsButton label="Refaire le traitement" variant="secondary-gray" :disabled="isRetrying" @click="showRetryModal = true" />
                <DsButton
                  :label="hasWarnings && !hasErrors && !isProcessingError && !isRetrying ? 'Finaliser malgré les avertissements' : 'Finaliser l\'import'"
                  :variant="hasErrors || isProcessingError || isRetrying ? 'secondary-gray' : 'primary'"
                  :disabled="hasErrors || isProcessingError || isRetrying"
                  @click="hasWarnings && !hasErrors ? showFinalizeWarningsModal = true : showFinalizeModal = true"
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { AlertTriangle, X, Table2, Trash2, ChevronDown, FileDown, Info, Plus } from 'lucide-vue-next'
import iconDataProcessing from '~/assets/images/icon-data-processing.svg'
import ScrollArea from '~/components/ui/ScrollArea.vue'
import { onClickOutside } from '@vueuse/core'
import { useScenarioStore } from '~/stores/scenario'
import type { MatchingResult, RowMatchingResult } from '~/types/scenario'

const scenario = useScenarioStore()

type Phase = 'processing' | 'results'
type Tab   = 'concordance' | 'fichiers'

const phase           = ref<Phase>('processing')
const activeTab       = ref<Tab>('concordance')
const showCancelModal            = ref(false)
const showRetryModal             = ref(false)
const showFinalizeModal          = ref(false)
const showFinalizeWarningsModal  = ref(false)
const retryMotif      = ref('')
const isRetrying      = ref(false)
const showColumnsDropdown = ref(false)
const showExportDropdown  = ref(false)
const columnsDropdownRef  = ref<HTMLElement | null>(null)
const exportDropdownRef   = ref<HTMLElement | null>(null)
let timer: ReturnType<typeof setTimeout>

onClickOutside(columnsDropdownRef, () => { showColumnsDropdown.value = false })
onClickOutside(exportDropdownRef,  () => { showExportDropdown.value  = false })

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

const isProcessingError = computed(() => scenario.fournisseurs?.processingError ?? false)

const rowResult = computed<RowMatchingResult | null>(() =>
  scenario.fournisseurs?.rowMatchingResult ?? null,
)

const result = computed<MatchingResult>(() =>
  scenario.fournisseurs?.matchingResult ?? DEFAULT_RESULT,
)

const totalMatched  = computed(() => rowResult.value?.totalMatched  ?? result.value.totalMatched)
const totalExpected = computed(() => rowResult.value?.totalExpected ?? result.value.totalExpected)

// Erreurs mapping colonnes (concordance tab)
const columnErrorCount = computed(() =>
  result.value.columns.filter(c => c.yourColumn === null).length,
)

const informationCount = computed(() =>
  result.value.columns.filter(c => c.isNewEntry).length,
)

// Erreurs/avertissements fichiers (fichiers tab)
const rowErrorCount   = computed(() => rowResult.value?.errorCount   ?? 0)
const warningCount    = computed(() => rowResult.value?.warningCount  ?? 0)

// Total pour le banner : somme des deux sources
const errorCount  = computed(() => columnErrorCount.value + rowErrorCount.value)

const hasErrors   = computed(() => errorCount.value > 0)
const hasWarnings = computed(() => warningCount.value > 0)

function startProcessing() {
  clearTimeout(timer)
  isRetrying.value = false
  phase.value = 'processing'
  timer = setTimeout(() => { phase.value = 'results' }, 4000)
}

watch(() => scenario.activeId, () => { startProcessing() })

const emit = defineEmits<{ back: []; add: []; cancel: []; 'finalize-start': [] }>()

function onFinalize() {
  showFinalizeModal.value = false
  showFinalizeWarningsModal.value = false
  emit('finalize-start')
}

function onRetry() {
  showRetryModal.value = false
  retryMotif.value = ''
  isRetrying.value = true
  clearTimeout(timer)
  timer = setTimeout(() => { isRetrying.value = false }, 4000)
}

onMounted(() => startProcessing())

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


/* ── Dropdown ── */
.dropdown-enter-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.dropdown-leave-active { transition: opacity 0.08s ease, transform 0.08s ease; }
.dropdown-enter-from,
.dropdown-leave-to { opacity: 0; transform: translateY(-4px); }

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
