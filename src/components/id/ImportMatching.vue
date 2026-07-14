<template>

  <!-- ── Phase: traitement en cours ─────────────────── -->
  <div v-if="phase === 'processing'" class="flex flex-col flex-1 min-h-0 overflow-hidden">
    <Header title="Producteurs">
      <template #actions>
        <DsButton label="Ajouter des producteurs" variant="primary" icon-leading="user-plus-01" @click="$emit('add')" />
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
                  {{ readyCount.toLocaleString('fr-FR') }} producteurs seront ajoutés à ta base ID. Cette action est irréversible.
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

        <!-- ── Modal de confirmation — Finaliser les valides (rejets mis de côté) ── -->
        <Transition name="cancel-modal">
          <div v-if="showFinalizePartialModal" class="absolute inset-0 z-50 flex items-center justify-center px-8">
            <div class="absolute inset-0 bg-[#0c111d]/70 backdrop-blur-sm" @click="showFinalizePartialModal = false" />
            <div class="relative bg-white rounded-xl w-full max-w-[544px] overflow-hidden shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)]">
              <!-- Header -->
              <div class="flex gap-4 items-start px-6 pt-6">
                <div class="flex items-center justify-center size-12 rounded-full bg-[#fef0c7] shrink-0">
                  <AlertTriangle :size="24" class="text-[#f79009]" />
                </div>
                <div class="flex flex-col gap-1 flex-1 min-w-0 pr-8">
                  <p class="text-[18px] font-semibold text-text-primary leading-7" style="font-family: var(--ds-typography-font-family-poppins)">Finaliser les producteurs valides</p>
                  <p class="text-sm text-text-secondary leading-5" style="font-family: var(--ds-typography-font-family-poppins)">
                    {{ readyCount.toLocaleString('fr-FR') }} producteurs valides seront ajoutés à ta base ID. Les {{ attentionCount.toLocaleString('fr-FR') }} producteurs en erreur sont mis de côté pour correction. Cette action est irréversible.
                  </p>
                </div>
              </div>
              <button
                class="absolute top-3 right-3 flex items-center justify-center w-11 h-11 rounded-lg text-text-quaternary hover:bg-surface transition-colors"
                @click="showFinalizePartialModal = false"
              >
                <X :size="24" />
              </button>
              <!-- Footer -->
              <div class="flex items-center justify-end gap-3 px-6 pt-8 pb-6">
                <DsButton label="Annuler" variant="secondary-gray" @click="showFinalizePartialModal = false" />
                <DsButton label="Finaliser les valides" variant="primary" @click="onFinalize" />
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

        <div class="flex flex-col flex-1 min-h-0 overflow-y-auto">

          <!-- En-tête du panel (sticky — reste visible au scroll) -->
          <div class="relative flex flex-col shrink-0 px-6 pt-8 pb-0 sticky top-0 bg-white z-20">
            <p class="text-2xl font-semibold text-text-primary leading-8">Bilan du traitement</p>
            <button
              class="absolute top-8 right-6 flex items-center justify-center w-10 h-10 rounded-lg text-text-quaternary hover:bg-surface transition-colors"
              @click="showCancelModal = true"
            >
              <X :size="20" />
            </button>
            <div class="mt-5 h-px bg-[#eaecf0]" />
          </div>

          <!-- Bilan : état d'abord + ventilation par fichier -->
          <div v-if="!isProcessingError && !isRetrying" class="flex flex-col gap-4 mx-6 mt-4 shrink-0">

            <!-- État : proportion prête (barre DsProgressBar) -->
            <div class="flex flex-col gap-4 p-5 bg-white border border-border rounded-2xl">
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-baseline gap-2 flex-wrap min-w-0">
                  <span class="text-[36px] font-semibold leading-[44px] text-text-primary" style="font-family: var(--ds-typography-font-family-poppins)">{{ readyCount.toLocaleString('fr-FR') }}</span>
                  <span class="text-base text-text-secondary" style="font-family: var(--ds-typography-font-family-inter)">producteurs prêts sur {{ totalExpected.toLocaleString('fr-FR') }}</span>
                </div>
                <div v-if="attentionCount > 0" class="flex items-center gap-2 pl-3 pr-3.5 py-1.5 bg-[#fef3f2] border border-[#fecdca] rounded-full shrink-0">
                  <AlertTriangle :size="16" class="text-[#d92d20] shrink-0" />
                  <span class="text-sm font-semibold text-[#b42318]" style="font-family: var(--ds-typography-font-family-poppins)">{{ attentionCount.toLocaleString('fr-FR') }} à corriger</span>
                </div>
              </div>
              <DsProgressBar :value="readyPct" />
            </div>

            <!-- Ventilation par fichier = switcher (état + navigation) -->
            <div class="flex flex-col gap-2">
              <p class="text-sm font-semibold text-text-secondary" style="font-family: var(--ds-typography-font-family-poppins)">Détail par fichier</p>
              <div class="grid grid-cols-3 gap-3">
                <div
                  v-for="blk in ventilation" :key="blk.key"
                  class="flex flex-col p-4 rounded-xl border transition-all duration-150"
                  :class="blk.active
                    ? 'bg-surface-active border-border'
                    : 'bg-white border-border hover:border-border-strong hover:shadow-[0px_1px_3px_rgba(16,24,40,0.1)]'"
                >
                  <button class="flex flex-col gap-2.5 text-left" @click="blk.onClick()">
                    <div class="flex flex-col gap-0.5">
                      <span class="text-sm font-semibold text-text-primary" style="font-family: var(--ds-typography-font-family-poppins)">{{ blk.name }}</span>
                      <span class="text-[13px] text-text-tertiary" style="font-family: var(--ds-typography-font-family-inter)">{{ blk.sub }}</span>
                    </div>
                    <span
                      class="self-start flex items-center px-2.5 py-1 rounded-full text-[13px] font-semibold"
                      :class="sevClass(blk.sev.kind)"
                      style="font-family: var(--ds-typography-font-family-poppins)"
                    >{{ blk.sev.label }}</span>
                  </button>
                  <!-- Entrée directe vers la Correction cartographique (fichier géo à corriger) -->
                  <button
                    v-if="blk.key === 'geo' && hasAtelierGeo && rowErrorCount > 0"
                    class="mt-3 self-start inline-flex items-center gap-1 text-[13px] font-semibold text-[#044b28] hover:gap-1.5 transition-all"
                    style="font-family: var(--ds-typography-font-family-poppins)"
                    @click="openCarto"
                  >
                    Corriger sur la carte
                    <ArrowRight :size="15" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Barre d'outils : filtre de validité (fichier actif) + actions -->
          <div class="flex items-center justify-between px-6 mt-3 shrink-0 gap-4">
            <!-- Filtre de validité — toujours visible hors concordance, même sur un fichier propre -->
            <div
              v-if="activeTab !== 'concordance'"
              class="flex items-center gap-1 p-1 bg-[#f9fafb] border border-[#eaecf0] rounded-[10px]"
            >
              <button
                v-for="f in validityTabs" :key="f.key"
                class="flex items-center gap-2 h-9 px-3 rounded-md text-sm font-semibold transition-all"
                :class="validityFilter === f.key
                  ? 'bg-white shadow-[0px_1px_2px_rgba(16,24,40,0.06)] text-text-secondary'
                  : 'text-text-quaternary'"
                style="font-family: var(--ds-typography-font-family-poppins)"
                @click="validityFilter = f.key"
              >
                {{ f.label }}
                <span class="text-text-tertiary" style="font-family: var(--ds-typography-font-family-inter)">{{ f.count }}</span>
              </button>
            </div>
            <!-- Filtre de concordance — statut des colonnes (occupe la gauche sur l'onglet concordance) -->
            <div
              v-else-if="activeTab === 'concordance'"
              class="flex items-center gap-1 p-1 bg-[#f9fafb] border border-[#eaecf0] rounded-[10px]"
            >
              <button
                v-for="f in concordanceTabs" :key="f.key"
                class="flex items-center gap-2 h-9 px-3 rounded-md text-sm font-semibold transition-all"
                :class="concordanceFilter === f.key
                  ? 'bg-white shadow-[0px_1px_2px_rgba(16,24,40,0.06)] text-text-secondary'
                  : 'text-text-quaternary'"
                style="font-family: var(--ds-typography-font-family-poppins)"
                @click="concordanceFilter = f.key"
              >
                {{ f.label }}
                <span class="text-text-tertiary" style="font-family: var(--ds-typography-font-family-inter)">{{ f.count }}</span>
              </button>
            </div>
            <div v-else />

            <!-- Actions -->
            <div class="flex items-center gap-2 shrink-0">

              <!-- Colonnes visibles -->
              <DsDropdown
                v-model:open="showColumnsDropdown"
                trigger="button"
                :button-label="activeTab === 'concordance' ? 'Voir toutes les colonnes' : 'Voir toutes les lignes'"
              >
                <div class="py-1">
                  <div
                    v-for="col in result.columns"
                    :key="col.tolbiColumn"
                    class="flex items-center px-3.5 py-2 hover:bg-[#f9fafb]"
                  >
                    <DsCheckbox
                      :model-value="!hiddenColumns.has(col.tolbiColumn)"
                      size="sm"
                      :label="col.tolbiColumn"
                      @update:model-value="() => toggleColumn(col.tolbiColumn)"
                    />
                  </div>
                </div>
              </DsDropdown>

              <!-- Export -->
              <div :class="isProcessingError ? 'opacity-50 pointer-events-none' : ''">
                <DsDropdown
                  v-model:open="showExportDropdown"
                  trigger="button"
                  button-label="Exporter sous format Excel"
                >
                  <DsDropdownItem
                    v-if="hasRowErrors"
                    class="ds-dropdown-item--danger"
                    :label="`Rejets (${attentionCount.toLocaleString('fr-FR')})`"
                    icon="file-x-03"
                    @click="exportRejets"
                  />
                  <DsDropdownDivider v-if="hasRowErrors" />
                  <DsDropdownItem label="Concordance" icon="file-check-03" @click="exportConcordance" />
                  <DsDropdownItem label="Toutes les données" icon="file-download-03" @click="exportToutesDonnees" />
                </DsDropdown>
              </div>

            </div>
          </div>

          <!-- Loading interne — Refaire le traitement -->
          <div v-if="isRetrying" class="min-h-[440px] mx-6 mt-3 bg-white border border-[#eaecf0] rounded-2xl flex flex-col items-center justify-center gap-12">
            <div class="spinner-lg" />
            <p class="text-[18px] font-medium leading-7 text-text-secondary text-center" style="font-family: var(--ds-typography-font-family-inter)">
              Environ 30 secondes — matching vers le modèle Tolbi...
            </p>
          </div>

          <!-- État d'erreur de traitement -->
          <div v-else-if="isProcessingError" class="min-h-[440px] mx-6 mt-3 bg-white border border-[#eaecf0] rounded-2xl flex items-center justify-center">
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
          <ScrollArea v-else-if="activeTab === 'concordance'" class="min-h-[440px] max-h-[560px] mx-6 mt-3 bg-white border border-[#eaecf0] rounded-2xl">
            <div class="flex items-start w-full">
              <div class="flex-1 flex flex-col min-w-0 border-r border-[#eaecf0]">
                <div class="sticky top-0 z-10 flex items-center h-16 px-6 py-3 bg-[#f9fafb] border-b border-[#eaecf0] shrink-0 w-full">
                  <span class="text-sm font-medium text-[#475467] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">Vos colonnes</span>
                </div>
                <div
                  v-for="(col, i) in filteredColumns" :key="`left-${i}`"
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
                  v-for="(col, i) in filteredColumns" :key="`right-${i}`"
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

          <!-- Détail géo / Excel — une seule table selon le fichier actif -->
          <div v-else class="mx-6 mt-3 shrink-0">

            <!-- Fichier propre (pas de rowResult) -->
            <div v-if="!rowResult" class="h-[300px] flex flex-col items-center justify-center gap-1 border border-[#eaecf0] rounded-2xl bg-white text-center">
              <p class="text-sm font-semibold text-text-primary" style="font-family: var(--ds-typography-font-family-poppins)">Aucune anomalie dans ce fichier</p>
              <p class="text-[13px] text-text-tertiary" style="font-family: var(--ds-typography-font-family-inter)">Toutes les lignes sont conformes au modèle Tolbi.</p>
            </div>

            <!-- Filtre sans résultat -->
            <div v-else-if="filteredRows.length === 0" class="h-[460px] flex items-center justify-center border border-[#eaecf0] rounded-2xl bg-white">
              <p class="text-sm text-text-tertiary" style="font-family: var(--ds-typography-font-family-poppins)">Rien à afficher pour ce filtre.</p>
            </div>

            <!-- Table du fichier actif (colonne Motif en tête) -->
            <ScrollArea v-else class="h-[460px] border border-[#eaecf0] rounded-2xl">
              <table class="border-collapse" style="min-width: max-content; width: 100%">
                <thead class="sticky top-0 z-10">
                  <tr>
                    <th v-if="hasActiveIssues" class="h-14 px-4 py-3 bg-[#f9fafb] border-b border-[#eaecf0] text-left text-sm font-medium text-[#475467] whitespace-nowrap" style="font-family: var(--ds-typography-font-family-inter)">Motif</th>
                    <th
                      v-for="col in activeColumns" :key="`col-${col}`"
                      class="h-14 px-4 py-3 bg-[#f9fafb] border-b border-[#eaecf0] text-left text-sm font-medium text-[#475467] whitespace-nowrap"
                      style="font-family: var(--ds-typography-font-family-inter)"
                    >{{ col }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in filteredRows" :key="`row-${row.index}`"
                    class="border-b border-[#eaecf0] last:border-b-0"
                    :class="rowBg(row)"
                  >
                    <td v-if="hasActiveIssues" class="h-16 px-4 py-3 align-middle min-w-[260px] max-w-[320px]">
                      <template v-if="activeRowMotif(row)">
                        <p class="text-sm font-semibold text-text-primary leading-5" style="font-family: var(--ds-typography-font-family-poppins)">{{ activeRowMotif(row)?.quoi }}</p>
                        <p class="text-[13px] text-text-tertiary leading-[18px]" style="font-family: var(--ds-typography-font-family-inter)">{{ activeRowMotif(row)?.cons }}</p>
                      </template>
                      <span v-else class="text-sm text-text-quaternary">—</span>
                    </td>
                    <td
                      v-for="(cell, ci) in activeCells(row)" :key="`cell-${row.index}-${ci}`"
                      class="h-16 px-4 py-3 whitespace-nowrap text-sm"
                      style="font-family: var(--ds-typography-font-family-inter)"
                    >
                      <EditableCell
                        :value="cell.value"
                        :has-error="cell.hasError"
                        :has-warning="cell.hasWarning"
                        :corrected="cell.corrected"
                        emphasis
                        @commit="(v) => applyCellEdit(cell, v)"
                      />
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
                <span class="text-sm font-medium text-text-secondary" style="font-family: var(--ds-typography-font-family-inter)">Producteurs répertoriés</span>
                <span class="text-sm font-semibold text-text-primary" style="font-family: var(--ds-typography-font-family-poppins)">{{ totalMatched.toLocaleString('fr-FR') }}</span>
              </div>
            </div>
          </div>

          <!-- Barre du bas -->
          <div class="flex flex-col gap-4 px-6 py-4 shrink-0 sticky bottom-0 bg-white z-10">
            <div class="h-px bg-[#eaecf0]" />
            <div class="flex items-center justify-between">
              <DsButton label="Annuler l'import" variant="secondary-gray" @click="showCancelModal = true" />
              <div class="flex items-center gap-3">
                <DsButton label="Refaire le traitement" variant="secondary-gray" :disabled="isRetrying" @click="showRetryModal = true" />
                <DsButton
                  :label="finalizeLabel"
                  :variant="hasStructuralErrors || isProcessingError || isRetrying ? 'secondary-gray' : 'primary'"
                  :disabled="hasStructuralErrors || isProcessingError || isRetrying"
                  @click="onFinalizeClick"
                />
              </div>
            </div>
          </div>

      </div>
    </div>
    </Transition>
  </Teleport>

  <!-- Correction cartographique (Phase 2) — overlay au-dessus du Bilan -->
  <CorrectionCarto v-if="showCarto" @close="showCarto = false" />

</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { AlertTriangle, X, Trash2, Plus, ArrowRight } from 'lucide-vue-next'
import iconDataProcessing from '~/assets/images/icon-data-processing.svg'
import ScrollArea from '~/components/ui/ScrollArea.vue'
import { useScenarioStore } from '~/stores/scenario'
import { useToastStore } from '~/stores/toast'
import type { MatchingResult, RowMatchingResult, DataRow, CellData } from '~/types/scenario'

const scenario = useScenarioStore()
const toast    = useToastStore()

type Phase = 'processing' | 'results'
type Tab   = 'concordance' | 'geo' | 'excel'

const phase           = ref<Phase>('processing')
const activeTab       = ref<Tab>('concordance')
const showCancelModal            = ref(false)
const showRetryModal             = ref(false)
const showFinalizeModal          = ref(false)
const showFinalizeWarningsModal  = ref(false)
const showFinalizePartialModal   = ref(false)
const retryMotif      = ref('')
const isRetrying      = ref(false)
const showColumnsDropdown = ref(false)
const showExportDropdown  = ref(false)
// Correction cartographique (Phase 2) — overlay plein écran ouvert depuis le fichier géo.
const showCarto = ref(false)
const hasAtelierGeo = computed(() => !!scenario.producteurs?.atelierGeo)
function openCarto() {
  activeTab.value = 'geo'
  validityFilter.value = 'corriger'
  showCarto.value = true
}
// Colonnes masquées via le sélecteur « Colonnes visibles » (cases DsCheckbox).
const hiddenColumns = ref<Set<string>>(new Set())
let timer: ReturnType<typeof setTimeout>

function toggleColumn(key: string) {
  const next = new Set(hiddenColumns.value)
  next.has(key) ? next.delete(key) : next.add(key)
  hiddenColumns.value = next
}

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

const isProcessingError = computed(() => scenario.producteurs?.processingError ?? false)

const rowResult = computed<RowMatchingResult | null>(() =>
  scenario.producteurs?.rowMatchingResult ?? null,
)

// Copie de travail mutable des lignes : la correction inline édite ceci, jamais
// le scénario mock (source en lecture seule). Réamorcée à chaque scénario.
const workingRows = ref<DataRow[]>([])
watch(rowResult, (rr) => {
  workingRows.value = rr ? JSON.parse(JSON.stringify(rr.rows)) as DataRow[] : []
}, { immediate: true })

// Édition inline d'une cellule (TOQ-577, généralisée à tous les champs).
// Réévaluation (TOQ-578) : effacer hasError/hasWarning fait chuter les compteurs
// dérivés → bannière, pastilles, bouton de finalisation et export rejets se recalculent.
function applyCellEdit(cell: CellData, value: string) {
  const v = value.trim()
  if (!v || v === cell.value) return
  cell.value = v
  if (cell.hasError)        { cell.hasError = false;   cell.corrected = true }
  else if (cell.hasWarning) { cell.hasWarning = false; cell.corrected = true }
}

const result = computed<MatchingResult>(() =>
  scenario.producteurs?.matchingResult ?? DEFAULT_RESULT,
)

const totalMatched  = computed(() => rowResult.value?.totalMatched  ?? result.value.totalMatched)
const totalExpected = computed(() => rowResult.value?.totalExpected ?? result.value.totalExpected)

// Erreurs mapping colonnes (concordance tab)
const columnErrorCount = computed(() =>
  result.value.columns.filter(c => c.yourColumn === null).length,
)

// Erreurs/avertissements fichiers (fichiers tab) — dérivés des cellules réelles
// de la copie de travail, pour que la correction inline se répercute partout.
const rowErrorCount = computed(() => workingRows.value.filter(r => r.geoCells.some(c => c.hasError)).length)
const warningCount  = computed(() => workingRows.value.filter(r => r.excelCells.some(c => c.hasWarning)).length)

const hasWarnings = computed(() => warningCount.value > 0)

// Erreurs structurelles (concordance des colonnes) : elles concernent tout le
// fichier — impossible de scinder producteur par producteur, la finalisation
// reste bloquée tant qu'elles ne sont pas résolues.
const hasStructuralErrors = computed(() => columnErrorCount.value > 0)
// Erreurs de données ligne à ligne : ce sont les rejets. On peut finaliser les
// producteurs valides et mettre ceux-là de côté pour correction.
const hasRowErrors = computed(() => rowErrorCount.value > 0)

// Résumé « prêts à créer » / « à corriger » (TOQ-497) — dérivé des compteurs réels.
const attentionCount = computed(() => rowErrorCount.value)
const readyCount     = computed(() => Math.max(0, totalExpected.value - attentionCount.value))

const finalizeLabel = computed(() => {
  if (hasStructuralErrors.value) return "Finaliser l'import"
  if (hasRowErrors.value)  return `Finaliser les ${readyCount.value.toLocaleString('fr-FR')} valides`
  if (hasWarnings.value)   return 'Finaliser malgré les avertissements'
  return "Finaliser l'import"
})

// ── Bilan : état d'abord (proportion prête) ─────────────────────────
const readyPct = computed(() => {
  const total = totalExpected.value || 1
  return Math.max(0, Math.min(100, (readyCount.value / total) * 100))
})

// ── Ventilation par fichier ─────────────────────────────────────────
// Chaque bloc porte sa sévérité et devient une porte vers sa correction.
type FileSeverity = { kind: 'error' | 'warning' | 'success'; label: string }
function sevClass(kind: FileSeverity['kind']) {
  if (kind === 'error')   return 'bg-[var(--ds-color-error-50)] border border-[var(--ds-color-error-200)] text-[var(--ds-color-error-700)]'
  if (kind === 'warning') return 'bg-[var(--ds-color-warning-50)] border border-[var(--ds-color-warning-200)] text-[var(--ds-color-warning-700)]'
  return 'bg-[var(--ds-color-success-50)] border border-[#abefc6] text-[var(--ds-color-success-700)]'
}
// Les 3 blocs SONT le switcher de fichier (état + navigation fusionnés).
const ventilation = computed(() => [
  {
    key: 'concordance' as Tab,
    name: 'Concordance des colonnes',
    sub:  `${result.value.columns.length} colonnes → modèle Tolbi`,
    sev:  columnErrorCount.value > 0
      ? { kind: 'error', label: `${columnErrorCount.value} bloquante${columnErrorCount.value > 1 ? 's' : ''}` } as FileSeverity
      : { kind: 'success', label: 'Aucune erreur' } as FileSeverity,
    active: activeTab.value === 'concordance',
    onClick: () => { activeTab.value = 'concordance' },
  },
  {
    key: 'geo' as Tab,
    name: 'Fichier géographique',
    sub:  'Géométries des parcelles',
    sev:  rowErrorCount.value > 0
      ? { kind: 'error', label: `${rowErrorCount.value} à corriger` } as FileSeverity
      : { kind: 'success', label: 'Aucune erreur' } as FileSeverity,
    active: activeTab.value === 'geo',
    onClick: () => { activeTab.value = 'geo'; validityFilter.value = rowErrorCount.value > 0 ? 'corriger' : 'tout' },
  },
  {
    key: 'excel' as Tab,
    name: 'Fichier Excel',
    sub:  'Attributs producteurs',
    sev:  warningCount.value > 0
      ? { kind: 'warning', label: `${warningCount.value} avertissement${warningCount.value > 1 ? 's' : ''}` } as FileSeverity
      : { kind: 'success', label: 'Aucun avertissement' } as FileSeverity,
    active: activeTab.value === 'excel',
    onClick: () => { activeTab.value = 'excel'; validityFilter.value = warningCount.value > 0 ? 'avertissements' : 'tout' },
  },
])

// ── Filtre de validité (détail) ─────────────────────────────────────
// Le filtre porte sur le fichier actif (géo ou Excel), pas sur les deux.
type Validity = 'tout' | 'corriger' | 'avertissements'
const validityFilter = ref<Validity>('tout')
const isExcelTab = computed(() => activeTab.value === 'excel')
const cellsOf = (r: DataRow) => (isExcelTab.value ? r.excelCells : r.geoCells)
const activeErrorCount   = computed(() => workingRows.value.filter(r => cellsOf(r).some(c => c.hasError)).length)
const activeWarningCount = computed(() => workingRows.value.filter(r => cellsOf(r).some(c => c.hasWarning)).length)
// Le fichier actif a-t-il quoi que ce soit à signaler ? Sinon on masque la colonne Motif.
const hasActiveIssues = computed(() => activeErrorCount.value > 0 || activeWarningCount.value > 0)
const validityTabs = computed(() => [
  { key: 'tout' as Validity,           label: 'Tout',           count: totalExpected.value.toLocaleString('fr-FR') },
  { key: 'corriger' as Validity,       label: 'À corriger',     count: String(activeErrorCount.value) },
  { key: 'avertissements' as Validity, label: 'Avertissements', count: String(activeWarningCount.value) },
])
const filteredRows = computed<DataRow[]>(() => {
  if (validityFilter.value === 'corriger')       return workingRows.value.filter(r => cellsOf(r).some(c => c.hasError))
  if (validityFilter.value === 'avertissements') return workingRows.value.filter(r => cellsOf(r).some(c => c.hasWarning))
  return workingRows.value
})

// ── Filtre de concordance (colonnes) — occupe la gauche de la barre sur l'onglet concordance ──
type ConcFilter = 'toutes' | 'reconnues' | 'manquantes' | 'nouvelles'
const concordanceFilter = ref<ConcFilter>('toutes')
const concordanceTabs = computed(() => {
  const cols = result.value.columns
  const reconnues  = cols.filter(c => c.yourColumn !== null && !c.isNewEntry).length
  const manquantes = cols.filter(c => c.yourColumn === null).length
  const nouvelles  = cols.filter(c => c.isNewEntry).length
  const tabs = [
    { key: 'toutes' as ConcFilter,     label: 'Toutes',     count: String(cols.length) },
    { key: 'reconnues' as ConcFilter,  label: 'Reconnues',  count: String(reconnues) },
    { key: 'manquantes' as ConcFilter, label: 'Manquantes', count: String(manquantes) },
  ]
  if (nouvelles > 0) tabs.push({ key: 'nouvelles' as ConcFilter, label: 'Nouvelles', count: String(nouvelles) })
  return tabs
})
const filteredColumns = computed(() => {
  const cols = result.value.columns
  if (concordanceFilter.value === 'reconnues')  return cols.filter(c => c.yourColumn !== null && !c.isNewEntry)
  if (concordanceFilter.value === 'manquantes') return cols.filter(c => c.yourColumn === null)
  if (concordanceFilter.value === 'nouvelles')  return cols.filter(c => c.isNewEntry)
  return cols
})

// ── Motifs en clair (Quoi · Conséquence) — tue le « trop technique » ─
// Mappe la colonne en cause vers un message humain à 3 temps.
const GEO_MOTIFS: Record<string, { quoi: string; cons: string }> = {
  DATE_GPS: { quoi: 'Date GPS invalide.',    cons: 'Le relevé est illisible — corrige la date ou recharge le tracé.' },
  WKT_GEOM: { quoi: 'Géométrie à corriger.', cons: 'Corrige la parcelle sur la carte.' },
  SURF_HA:  { quoi: 'Surface hors plage.',   cons: 'Vérifie la superficie de la parcelle.' },
}
const EXCEL_MOTIFS: Record<string, { quoi: string; cons: string }> = {
  Ref_Waypoint: { quoi: 'Référence waypoint manquante.', cons: 'Le rattachement à la parcelle ne pourra pas être vérifié.' },
  Nom:          { quoi: 'Nom manquant.',                 cons: 'Le producteur sera importé sans nom.' },
  CNI:          { quoi: 'Pièce d’identité manquante.',   cons: 'Le producteur sera importé sans CNI.' },
}
function cellMotif(colName: string, isGeo: boolean) {
  const map = isGeo ? GEO_MOTIFS : EXCEL_MOTIFS
  return map[colName] ?? (isGeo
    ? { quoi: 'Donnée géographique invalide.', cons: 'Corrige la valeur ou recharge le tracé.' }
    : { quoi: 'Champ à vérifier.',             cons: 'Le producteur sera importé tel quel.' })
}
function geoRowMotif(row: DataRow) {
  // Motif géométrique porté par la ligne (sommet aberrant, contour, rattachement) —
  // prioritaire sur le motif dérivé de la colonne en cause.
  if (row.motif) return row.motif
  const i = row.geoCells.findIndex(c => c.hasError || c.hasWarning)
  return i < 0 ? null : cellMotif(rowResult.value?.geoColumns[i] ?? '', true)
}
function excelRowMotif(row: DataRow) {
  const i = row.excelCells.findIndex(c => c.hasError || c.hasWarning)
  return i < 0 ? null : cellMotif(rowResult.value?.excelColumns[i] ?? '', false)
}

// Colonnes / cellules / motif / fond du fichier actuellement affiché (géo ou Excel).
const activeColumns = computed<string[]>(() =>
  isExcelTab.value ? (rowResult.value?.excelColumns ?? []) : (rowResult.value?.geoColumns ?? []),
)
function activeCells(row: DataRow) { return isExcelTab.value ? row.excelCells : row.geoCells }
function activeRowMotif(row: DataRow) { return isExcelTab.value ? excelRowMotif(row) : geoRowMotif(row) }
function rowBg(row: DataRow) {
  const cells = activeCells(row)
  if (cells.some(c => c.hasError))   return 'bg-[var(--ds-color-error-50)]'
  if (cells.some(c => c.hasWarning)) return 'bg-[var(--ds-color-warning-50)]'
  return 'bg-white'
}

function startProcessing() {
  clearTimeout(timer)
  isRetrying.value = false
  phase.value = 'processing'
  timer = setTimeout(() => { phase.value = 'results' }, 4000)
}

watch(() => scenario.activeId, () => { startProcessing() })

const emit = defineEmits<{ back: []; add: []; cancel: []; 'finalize-start': [summary: { ready: number; attention: number }] }>()

function onFinalizeClick() {
  if (hasRowErrors.value)      showFinalizePartialModal.value = true
  else if (hasWarnings.value)  showFinalizeWarningsModal.value = true
  else                         showFinalizeModal.value = true
}

function onFinalize() {
  showFinalizeModal.value = false
  showFinalizeWarningsModal.value = false
  showFinalizePartialModal.value = false
  emit('finalize-start', { ready: readyCount.value, attention: attentionCount.value })
}

// ── Exports (CSV compatible Excel) — TOQ-575 ────────────────────────
// BOM UTF-8 pour que les accents (Cissé, préfecture…) s'ouvrent bien dans Excel.
function downloadCsv(filename: string, matrix: (string | number)[][]) {
  const csv = matrix
    .map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const today = () => new Date().toISOString().slice(0, 10)

// Producteurs en erreur → fichier « Rejets » pour correction externe et réimport.
function exportRejets() {
  showExportDropdown.value = false
  const rr = rowResult.value
  if (!rr) return
  const rejets = rr.rows.filter(r => r.geoCells.some(c => c.hasError))
  const matrix: (string | number)[][] = [
    ['Colonnes en erreur', ...rr.geoColumns, ...rr.excelColumns],
    ...rejets.map(r => {
      const motif = r.motif?.quoi ?? r.geoCells.map((c, i) => (c.hasError ? rr.geoColumns[i] : null)).filter(Boolean).join(', ')
      return [motif, ...r.geoCells.map(c => c.value), ...r.excelCells.map(c => c.value)]
    }),
  ]
  downloadCsv(`rejets-import-${today()}.csv`, matrix)
  toast.show({
    title:       'Rejets exportés',
    description: `${attentionCount.value.toLocaleString('fr-FR')} producteurs à corriger. Corrige-les puis relance un import.`,
    duration:    8000,
  })
}

function exportConcordance() {
  showExportDropdown.value = false
  const matrix: (string | number)[][] = [
    ['Vos colonnes', 'Colonnes Tolbi', 'Statut'],
    ...result.value.columns.map(c => [
      c.yourColumn ?? '(colonne manquante)',
      c.tolbiColumn,
      c.yourColumn === null ? 'Manquante' : c.isNewEntry ? 'Nouvelle entrée' : 'OK',
    ]),
  ]
  downloadCsv(`concordance-import-${today()}.csv`, matrix)
  toast.show({ title: 'Concordance exportée', description: 'La correspondance des colonnes est dans tes téléchargements.' })
}

function exportToutesDonnees() {
  showExportDropdown.value = false
  const rr = rowResult.value
  if (!rr) { exportConcordance(); return }
  const matrix: (string | number)[][] = [
    [...rr.geoColumns, ...rr.excelColumns],
    ...rr.rows.map(r => [...r.geoCells.map(c => c.value), ...r.excelCells.map(c => c.value)]),
  ]
  downloadCsv(`import-donnees-${today()}.csv`, matrix)
  toast.show({ title: 'Données exportées', description: `${totalMatched.value.toLocaleString('fr-FR')} producteurs dans tes téléchargements.` })
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
.cancel-modal-enter-active { transition: opacity var(--ds-motion-duration-moderate) ease, transform var(--ds-motion-duration-moderate) ease; }
.cancel-modal-leave-active { transition: opacity var(--ds-motion-duration-quick) ease, transform var(--ds-motion-duration-quick) ease; }
.cancel-modal-enter-from,
.cancel-modal-leave-to { opacity: 0; transform: scale(0.97); }

/* ── Sheet slide-up ── */
.sheet-enter-active {
  transition: transform 0.42s cubic-bezier(0.16, 1, 0.3, 1);
}
.sheet-leave-active {
  transition: transform 0.28s var(--ds-motion-easing-in);
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
  border: 4px solid var(--ds-color-gray-light-200);
  border-top-color: var(--ds-semantic-fg-brand-primary, #056033);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
