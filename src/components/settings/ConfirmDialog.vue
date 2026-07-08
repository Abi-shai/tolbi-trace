<template>
  <Modal
    :model-value="modelValue"
    :title="title"
    :description="description"
    size="sm"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #footer>
      <DsButton label="Annuler" variant="secondary-gray" size="md" @click="emit('update:modelValue', false)" />
      <DsButton
        :label="confirmLabel"
        :variant="tone === 'danger' ? 'danger' : 'primary'"
        size="md"
        @click="onConfirm"
      />
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '~/components/ui/Modal.vue'

withDefaults(
  defineProps<{
    modelValue:   boolean
    title:        string
    description?: string
    confirmLabel?: string
    tone?:        'danger' | 'primary'
  }>(),
  { confirmLabel: 'Supprimer', tone: 'danger' },
)

const emit = defineEmits<{ 'update:modelValue': [boolean]; confirm: [] }>()

function onConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>
