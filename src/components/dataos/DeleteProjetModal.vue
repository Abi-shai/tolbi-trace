<template>
  <Modal
    :model-value="true"
    size="md"
    title="Supprimer le projet ?"
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
import type { Projet } from '~/types/dataos'

const props = defineProps<{ projet: Projet }>()
defineEmits<{ confirm: []; cancel: [] }>()

const description = computed(() => {
  const name = props.projet.name?.trim()
  const base = name ? `Le projet « ${name} »` : 'Ce projet'
  const n = props.projet.formulaires
  return n > 0
    ? `${base}, ses ${n.toLocaleString('fr-FR')} formulaire${n > 1 ? 's' : ''} et les données collectées seront définitivement supprimés. Cette action est irréversible.`
    : `${base} sera définitivement supprimé. Cette action est irréversible.`
})
</script>
