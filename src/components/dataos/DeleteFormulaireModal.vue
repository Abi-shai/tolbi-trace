<template>
  <Modal
    :model-value="true"
    size="md"
    title="Supprimer le formulaire ?"
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
import type { Formulaire } from '~/types/dataos'

const props = defineProps<{ formulaire: Formulaire }>()
defineEmits<{ confirm: []; cancel: [] }>()

const description = computed(() => {
  const name = props.formulaire.name?.trim()
  const base = name ? `Le formulaire « ${name} »` : 'Ce formulaire'
  const n = props.formulaire.reponses
  return n > 0
    ? `${base} et ses ${n.toLocaleString('fr-FR')} réponses seront définitivement supprimés. Cette action est irréversible.`
    : `${base} sera définitivement supprimé. Cette action est irréversible.`
})
</script>
