<template>
  <SlideOverPanel
    ref="panel"
    :title="isEdit ? 'Renommer le formulaire' : 'Créer un formulaire'"
    :supporting-text="isEdit
      ? 'Modifie le nom et la description du formulaire.'
      : 'Donne un nom à ton formulaire de collecte.'"
    @close="$emit('close')"
  >
    <template #icon>
      <Plus :size="20" />
    </template>

    <DsInputField
      label="Nom du formulaire"
      type="text"
      v-model="name"
      @keydown.enter="handleSubmit"
      placeholder="Ex. Recensement producteur"
    />

    <DsTextareaField
      label="Description du formulaire (optionnel)"
      v-model="description"
      placeholder="Décris ce que ce formulaire permet de collecter…"
    />

    <template #footer="{ close }">
      <DsButton label="Annuler" variant="secondary-gray" @click="close" />
      <DsButton
        :label="isEdit ? 'Enregistrer' : 'Créer le formulaire'"
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
import type { Formulaire } from '~/types/dataos'

const props = defineProps<{ formulaire?: Formulaire | null }>()

const emit = defineEmits<{
  submit: [name: string, description: string]
  close:  []
}>()

const panel       = ref<InstanceType<typeof SlideOverPanel> | null>(null)
const isEdit      = computed(() => !!props.formulaire)
const name        = ref(props.formulaire?.name ?? '')
const description = ref(props.formulaire?.description ?? '')
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
