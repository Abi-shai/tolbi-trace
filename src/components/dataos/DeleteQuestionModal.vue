<template>
  <Modal
    :model-value="true"
    size="md"
    title="Supprimer la question ?"
    :description="description"
    @update:model-value="$emit('cancel')"
  >
    <template #icon>
      <div
        class="flex items-center justify-center size-12 rounded-full shrink-0"
        style="background-color: var(--ds-color-error-100, #fee4e2)"
      >
        <AlertTriangle :size="24" style="color: var(--ds-color-error-600, #d92d20)" />
      </div>
    </template>

    <template #footer>
      <DsButton label="Annuler" variant="secondary-gray" @click="$emit('cancel')" />
      <DsButton label="Supprimer" variant="danger" @click="$emit('confirm')" />
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'
import Modal from '~/components/ui/Modal.vue'
import type { Question } from '~/types/dataos'

const props = defineProps<{ question: Question }>()
defineEmits<{ confirm: []; cancel: [] }>()

const description = computed(() => {
  const label = props.question.label?.trim()
  return label
    ? `La question « ${label} » sera retirée du formulaire. Cette action est irréversible.`
    : 'Cette question sera retirée du formulaire. Cette action est irréversible.'
})
</script>
