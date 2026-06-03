<template>
  <Modal
    :model-value="true"
    title="Modifications non enregistrées"
    description="Vous avez des modifications non enregistrées. Voulez-vous les enregistrer avant de quitter ?"
    @update:model-value="$emit('cancel')"
  >
    <template #footer>
      <DsButton label="Quitter sans enregistrer" variant="secondary-gray" @click="$emit('discard')" />
      <DsButton label="Enregistrer" variant="primary" @click="$emit('save')" />
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '~/components/ui/Modal.vue'

defineEmits<{ save: []; discard: []; cancel: [] }>()
</script>
