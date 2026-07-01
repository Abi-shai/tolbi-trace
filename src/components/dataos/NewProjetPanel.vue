<template>
  <SlideOverPanel
    ref="panel"
    :title="isEdit ? 'Renommer le projet' : 'Créer un projet'"
    :supporting-text="isEdit
      ? 'Modifie le nom et la description du projet.'
      : 'Remplis les informations requises, puis crée ton projet.'"
    @close="$emit('close')"
  >
    <template #icon>
      <Plus :size="20" />
    </template>

    <DsInputField
      label="Nom du projet"
      type="text"
      v-model="name"
      @keydown.enter="handleSubmit"
      placeholder="Ex. Pilote_Mais_Sud"
    />

    <DsTextareaField
      label="Description du projet (optionnel)"
      v-model="description"
      placeholder="Donne une description à ton projet…"
    />

    <template #footer="{ close }">
      <DsButton label="Annuler" variant="secondary-gray" @click="close" />
      <DsButton
        :label="isEdit ? 'Enregistrer' : 'Créer le projet'"
        variant="primary"
        :loading="submitting"
        :disabled="!name.trim()"
        @click="handleSubmit"
      />
    </template>
  </SlideOverPanel>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { Plus } from 'lucide-vue-next'
import SlideOverPanel from '~/components/ui/SlideOverPanel.vue'
import type { Projet } from '~/types/dataos'

const props = defineProps<{ projet?: Projet | null }>()

const emit = defineEmits<{
  submit: [name: string, description: string]
  close:  []
}>()

const panel       = ref<InstanceType<typeof SlideOverPanel> | null>(null)
const isEdit      = computed(() => !!props.projet)
const name        = ref(props.projet?.name ?? '')
const description = ref(props.projet?.description ?? '')
const submitting  = ref(false)
let submitTimer: ReturnType<typeof setTimeout>

function handleSubmit() {
  if (!name.value.trim() || submitting.value) return
  submitting.value = true
  submitTimer = setTimeout(() => {
    emit('submit', name.value.trim(), description.value.trim())
    panel.value?.close()
  }, 600)
}

onBeforeUnmount(() => clearTimeout(submitTimer))
</script>
