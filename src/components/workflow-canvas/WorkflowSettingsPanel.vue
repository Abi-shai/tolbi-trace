<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="builder.settingsPanelOpen" class="fixed inset-0 z-40 bg-black/20" @click="builder.closeSettings()" />
    </Transition>

    <Transition name="slide-panel">
      <aside
        v-if="builder.settingsPanelOpen"
        class="fixed inset-y-0 right-0 z-50 w-[400px] bg-white border-l border-border-strong shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] flex flex-col overflow-hidden"
      >
        <!-- Header -->
        <div class="relative px-6 pt-6 pb-0 shrink-0 flex flex-col gap-4">
          <DsCloseButton @click="builder.closeSettings()" class="absolute top-6 right-4" />

          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-center w-10 h-10 rounded-lg border border-border shadow-xs text-text-tertiary">
              <Settings2 :size="16" />
            </div>
            <div class="flex flex-col gap-1">
              <h2 class="text-xl font-semibold text-text-primary leading-[30px]">Paramètres</h2>
              <p class="text-sm text-text-tertiary leading-5">
                Modifiez le nom et la description de ce processus.
              </p>
            </div>
          </div>

          <div class="h-px bg-border w-full" />
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6">
          <DsInputField
            label="Nom du processus"
            type="text"
            :model-value="builder.workflowName"
            @update:model-value="(val: string) => builder.updateWorkflowMeta(val, builder.workflowDescription)"
            placeholder="Ex. Collecte maïs — Campagne nov. 2025"
          />

          <DsTextareaField
            label="Description"
            hint="Optionnel"
            :model-value="builder.workflowDescription"
            @update:model-value="(val: string) => builder.updateWorkflowMeta(builder.workflowName, val)"
            placeholder="Décrivez l'objectif et le contexte de ce processus…"
          />
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Settings2 } from 'lucide-vue-next'
import { useWorkflowBuilderStore } from '~/stores/workflow-builder'

const builder = useWorkflowBuilderStore()
</script>
