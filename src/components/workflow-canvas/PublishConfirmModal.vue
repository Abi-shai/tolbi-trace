<template>
  <Modal
    :model-value="true"
    title="Publier le processus"
    description="Une fois publié, ce processus sera visible et accessible aux agents sur l'application mobile. Vous pourrez le repasser en brouillon à tout moment."
    @update:model-value="$emit('cancel')"
  >
    <template #footer>
      <DsButton label="Annuler" variant="secondary-gray" @click="$emit('cancel')" />
      <DsButton label="Publier" variant="primary" @click="$emit('confirm')" />
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '~/components/ui/Modal.vue'

defineEmits<{ confirm: []; cancel: [] }>()
</script>
