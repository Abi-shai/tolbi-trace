<template>
  <Modal
    :model-value="true"
    size="lg"
    title="Revenir en arrière"
    description="Les fichiers déposés ne seront pas conservés. Tu devras les redéposer pour lancer l'analyse."
    @update:model-value="$emit('cancel')"
  >
    <template #icon>
      <div
        class="flex items-center justify-center size-12 rounded-full shrink-0"
        style="background-color: var(--ds-color-warning-100, #fef0c7)"
      >
        <AlertTriangle
          :size="24"
          style="color: var(--ds-color-warning-600, #dc6803)"
        />
      </div>
    </template>

    <template #footer>
      <DsButton
        label="Continuer le chargement"
        variant="secondary-gray"
        @click="$emit('cancel')"
      />
      <DsButton
        label="Revenir quand même"
        variant="primary"
        @click="$emit('confirm')"
      />
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import Modal from '~/components/ui/Modal.vue'

defineEmits<{ confirm: []; cancel: [] }>()
</script>
