<template>
  <SlideOverPanel
    v-if="builder.settingsPanelOpen"
    title="Paramètres"
    supporting-text="Modifiez le nom et la description de ce processus."
    @close="builder.closeSettings()"
  >
    <template #icon>
      <Settings2 :size="20" />
    </template>

    <DsInputField
      label="Nom du processus"
      type="text"
      :model-value="builder.workflowName"
      @update:model-value="(val: string) => builder.updateWorkflowMeta(val, builder.workflowDescription)"
      placeholder="Ex. Collecte maïs — Campagne nov. 2025"
    />

    <DsTextareaField
      label="Description (optionnel)"
      :model-value="builder.workflowDescription"
      @update:model-value="(val: string) => builder.updateWorkflowMeta(builder.workflowName, val)"
      placeholder="Décrivez l'objectif et le contexte de ce processus…"
    />
  </SlideOverPanel>
</template>

<script setup lang="ts">
import { Settings2 } from 'lucide-vue-next'
import SlideOverPanel from '~/components/ui/SlideOverPanel.vue'
import { useWorkflowBuilderStore } from '~/stores/workflow-builder'

const builder = useWorkflowBuilderStore()
</script>
