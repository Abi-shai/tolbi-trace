<template>
  <div class="flex flex-col bg-white rounded-xl border border-border overflow-visible hover:shadow-sm transition-shadow">

    <!-- Header : nom + statut + menu -->
    <div class="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
      <div class="flex flex-col gap-1.5 min-w-0">
        <p class="text-base font-semibold text-text-primary truncate">{{ projet.name }}</p>
      </div>

      <!-- Menu kebab (DsDropdown) -->
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
        <span class="flex items-center gap-1.5"><DsIcon name="file-02" :size="16" /> {{ projet.formulaires }} formulaires</span>
        <span class="flex items-center gap-1.5"><DsIcon name="clipboard-check" :size="16" /> {{ projet.reponses.toLocaleString('fr-FR') }} réponses</span>
        <span class="flex items-center gap-1.5"><DsIcon name="users-01" :size="16" /> {{ projet.agents }} agents</span>
      </div>
      <DsButton label="Voir le projet" variant="secondary-gray" size="sm" @click="$emit('view', projet)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Projet } from '~/types/dataos'

const props = defineProps<{ projet: Projet }>()

const emit = defineEmits<{
  view:      [projet: Projet]
  rename:    [projet: Projet]
  duplicate: [projet: Projet]
  remove:    [projet: Projet]
}>()

const menuOpen = ref(false)

function act(action: 'rename' | 'duplicate' | 'remove') {
  menuOpen.value = false
  emit(action, props.projet)
}
</script>
