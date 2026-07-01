<template>
  <div class="flex flex-col bg-white rounded-xl border border-border overflow-visible hover:shadow-sm transition-shadow">

    <!-- Header : nom + menu -->
    <div class="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
      <p class="text-base font-semibold text-text-primary truncate min-w-0">{{ formulaire.name }}</p>

      <div class="shrink-0">
        <DsDropdown trigger="icon" v-model:open="menuOpen">
          <DsDropdownItem label="Copier le lien" icon="clipboard-check" @click="onCopyLink" />
          <!-- Partager : icône lucide Share2, cohérente avec le reste du flux
               (onglet Agents…). Le DS n'a pas de glyphe « share » et DsDropdownItem
               ne rend que des slugs DsIcon → item recomposé à l'identique du DS. -->
          <button type="button" role="menuitem" class="qshare-item" @click="onShareWhatsApp">
            <span class="qshare-item__content">
              <Share2 :size="16" class="qshare-item__icon" />
              <span class="qshare-item__label">Partager sur WhatsApp</span>
            </span>
          </button>
          <DsDropdownDivider />
          <DsDropdownItem label="Renommer" icon="edit-01" @click="act('rename')" />
          <DsDropdownItem label="Dupliquer" icon="file-plus-01" @click="act('duplicate')" />
          <DsDropdownDivider />
          <DsDropdownItem class="ds-dropdown-item--danger" label="Supprimer" icon="trash-01" @click="act('remove')" />
        </DsDropdown>
      </div>
    </div>

    <div class="h-px bg-border" />

    <!-- Footer : stats + action -->
    <div class="flex items-center justify-between gap-4 px-5 py-3 flex-wrap">
      <div class="flex items-center gap-5 text-sm text-text-tertiary">
        <span class="flex items-center gap-1.5">
          <DsIcon name="clipboard-check" :size="16" /> {{ formulaire.reponses.toLocaleString('fr-FR') }} réponses
        </span>
      </div>
      <DsButton label="Ouvrir le formulaire" variant="secondary-gray" size="sm" @click="$emit('open', formulaire)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Share2 } from 'lucide-vue-next'
import { useFormulaireShare } from '~/composables/useFormulaireShare'
import type { Formulaire } from '~/types/dataos'

const props = defineProps<{ formulaire: Formulaire }>()

const emit = defineEmits<{
  open:      [formulaire: Formulaire]
  rename:    [formulaire: Formulaire]
  duplicate: [formulaire: Formulaire]
  remove:    [formulaire: Formulaire]
}>()

const menuOpen = ref(false)
const { copyLink, shareWhatsApp } = useFormulaireShare()

function act(action: 'rename' | 'duplicate' | 'remove') {
  menuOpen.value = false
  emit(action, props.formulaire)
}

// TOQ-560 : partage du lien aussi accessible depuis la liste des formulaires.
function onCopyLink() {
  menuOpen.value = false
  copyLink(props.formulaire.id)
}
function onShareWhatsApp() {
  menuOpen.value = false
  shareWhatsApp(props.formulaire.id, props.formulaire.name)
}
</script>

<style scoped>
/* Item « Partager » recomposé à l'identique de DsDropdownItem (mêmes métriques
   et tokens) pour héberger l'icône lucide Share2 que DsDropdownItem ne peut pas
   rendre (il n'accepte que des slugs DsIcon). */
.qshare-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 1px 6px;
  cursor: pointer;
  flex-shrink: 0;
  box-sizing: border-box;
  background: none;
  border: 0;
  text-align: left;
  font: inherit;
}
.qshare-item__content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  padding: 9px 10px;
  border-radius: var(--ds-radius-sm);
  transition: background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}
.qshare-item:hover .qshare-item__content,
.qshare-item:focus-visible .qshare-item__content {
  background-color: var(--ds-semantic-bg-primary-hover);
}
.qshare-item:focus-visible { outline: none; }
.qshare-item__icon {
  flex-shrink: 0;
  color: var(--ds-semantic-fg-secondary);
}
.qshare-item__label {
  font-family: var(--ds-typography-font-family-inter);
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: var(--ds-semantic-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}
</style>
