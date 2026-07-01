<template>
  <SlideOverPanel
    ref="panel"
    title="Modifier la réponse"
    :width="480"
    :before-close="tryClose"
    @close="$emit('close')"
  >
    <template #icon>
      <DsIcon name="edit-01" :size="20" />
    </template>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-text-secondary">Niveau</label>
      <DsInputField v-model="form.niveau" placeholder="Ex. Géométrie" />
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-text-secondary">Stade</label>
      <DsInputDropdown placeholder="Choisis le stade" :options="stadeOptions" v-model="form.stade" />
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-text-secondary">Culture trouvées</label>
      <DsInputField v-model="form.culture" placeholder="Ex. Arachide" />
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-text-secondary">Nom de l'enquêteur</label>
      <DsInputField v-model="form.nomEnqueteur" placeholder="Nom" />
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-text-secondary">Prénom de l'enquêteur</label>
      <DsInputField v-model="form.prenomEnqueteur" placeholder="Prénom" />
    </div>

    <template #footer="{ close }">
      <DsButton label="Annuler" variant="secondary-gray" @click="close" />
      <DsButton label="Enregistrer" variant="primary" @click="handleSave" />
    </template>
  </SlideOverPanel>

  <!-- Confirmation d'annulation des modifications (design Figma 128:29240) -->
  <Modal
    v-if="confirmOpen"
    :model-value="true"
    title="Annuler les modifications ?"
    description="Veux-tu annuler les modifications que tu as apportées ?"
    @update:model-value="confirmOpen = false"
  >
    <template #footer>
      <DsButton label="Continuer les modifications" variant="secondary-gray" @click="confirmOpen = false" />
      <DsButton label="Annuler les modifications" variant="danger" @click="onConfirmDiscard" />
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import SlideOverPanel from '~/components/ui/SlideOverPanel.vue'
import Modal from '~/components/ui/Modal.vue'
import type { SuiviReponse } from '~/data/dataos'

const props = defineProps<{ reponse: SuiviReponse }>()

const emit = defineEmits<{
  save:  [reponse: SuiviReponse]
  close: []
}>()

const panel       = ref<InstanceType<typeof SlideOverPanel> | null>(null)
const confirmOpen = ref(false)
const allowClose  = ref(false)

const stadeOptions = [
  { label: 'Accepté',  value: 'accepte'  },
  { label: 'En cours', value: 'en-cours' },
  { label: 'Rejeté',   value: 'rejete'   },
]

const form     = reactive<SuiviReponse>({ ...props.reponse })
const original = JSON.stringify(props.reponse)
const dirty    = computed(() => JSON.stringify(form) !== original)

// Garde de fermeture : tant qu'il y a des changements non enregistrés, on confirme.
function tryClose() {
  if (allowClose.value) return true
  if (dirty.value) {
    confirmOpen.value = true
    return false
  }
  return true
}

function handleSave() {
  emit('save', { ...form })
  allowClose.value = true
  panel.value?.close()
}

function onConfirmDiscard() {
  confirmOpen.value = false
  allowClose.value = true
  panel.value?.close()
}
</script>
