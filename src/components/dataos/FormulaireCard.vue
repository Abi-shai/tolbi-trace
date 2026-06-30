<template>
  <div class="flex flex-col bg-white rounded-xl border border-border overflow-visible hover:shadow-sm transition-shadow">

    <!-- Header : nom + statut + menu -->
    <div class="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
      <div class="flex items-center gap-2.5 min-w-0 flex-wrap">
        <p class="text-base font-semibold text-text-primary truncate">{{ formulaire.name }}</p>
        <DsBadge :label="statusMeta.label" :color="statusMeta.color" variant="pill-color" size="sm" :dot="true" />
      </div>

      <div class="shrink-0">
        <DsDropdown trigger="icon" v-model:open="menuOpen">
          <DsDropdownItem label="Renommer" icon="edit-01" @click="act('rename')" />
          <DsDropdownItem label="Dupliquer" icon="file-plus-01" @click="act('duplicate')" />
          <DsDropdownDivider />
          <DsDropdownItem label="Supprimer" icon="trash-01" @click="act('remove')" />
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
import { ref, computed } from 'vue'
import type { Formulaire, FormulaireStatus } from '~/types/dataos'

const props = defineProps<{ formulaire: Formulaire }>()

const emit = defineEmits<{
  open:      [formulaire: Formulaire]
  rename:    [formulaire: Formulaire]
  duplicate: [formulaire: Formulaire]
  remove:    [formulaire: Formulaire]
}>()

const menuOpen = ref(false)

const STATUS_META: Record<FormulaireStatus, { label: string; color: string }> = {
  brouillon: { label: 'Brouillon', color: 'gray'    },
  publie:    { label: 'Publié',    color: 'success' },
}
const statusMeta = computed(() => STATUS_META[props.formulaire.status])

function act(action: 'rename' | 'duplicate' | 'remove') {
  menuOpen.value = false
  emit(action, props.formulaire)
}
</script>
