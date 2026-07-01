<template>
  <SlideOverPanel
    title="Nouveau processus"
    supporting-text="Donnez un nom à votre processus."
    @close="$emit('close')"
  >
    <template #icon>
      <Route :size="20" />
    </template>

    <DsInputField
      label="Nom du processus"
      type="text"
      v-model="name"
      @keydown.enter="handleSubmit"
      placeholder="Ex. Collecte maïs — Campagne nov. 2025"
    />

    <DsTextareaField
      label="Description (optionnel)"
      v-model="description"
      placeholder="Décrivez l'objectif et le contexte de ce processus…"
    />

    <template #footer="{ close }">
      <DsButton label="Annuler" variant="secondary-gray" @click="close" />
      <DsButton label="Créer le processus" variant="primary" :disabled="!name.trim()" @click="handleSubmit" />
    </template>
  </SlideOverPanel>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Route } from 'lucide-vue-next'
import SlideOverPanel from '~/components/ui/SlideOverPanel.vue'

const emit = defineEmits<{
  create: [name: string, description: string]
  close:  []
}>()

const name        = ref('')
const description = ref('')

function handleSubmit() {
  if (!name.value.trim()) return
  emit('create', name.value.trim(), description.value.trim())
}
</script>
