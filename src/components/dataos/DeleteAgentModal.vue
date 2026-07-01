<template>
  <Modal
    :model-value="true"
    size="md"
    title="Supprimer l'agent ?"
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
import type { DataosAgent } from '~/types/dataos-agent'

const props = defineProps<{ agent: DataosAgent }>()
defineEmits<{ confirm: []; cancel: [] }>()

const description = computed(() => {
  const name = props.agent.name?.trim()
  const base = name ? `L'agent « ${name} »` : 'Cet agent'
  // On assume l'utilisateur : la suppression détache l'agent de son historique
  // (voir ADR-0007 qui supersède ADR-0005) — on le dit explicitement.
  return `${base} sera définitivement supprimé. Son historique d'activité ne sera plus rattaché à aucun agent. Cette action est irréversible.`
})
</script>
