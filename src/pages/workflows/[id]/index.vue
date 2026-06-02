<template>
  <div v-if="!workflow" class="flex flex-col flex-1 min-h-0 overflow-hidden items-center justify-center">
    <div class="text-sm text-text-quaternary">Chargement…</div>
  </div>

  <div v-else class="flex flex-col flex-1 min-h-0 overflow-hidden">
    <WorkflowToolbar
      :workflow-id="workflow.id"
      :workflow-name="workflow.name"
      :description="workflow.description"
      :status="workflow.status"
      :step-count="steps.length"
    />

    <!-- Draft banner -->
    <div v-if="workflow.status === 'draft'" class="flex items-center gap-2 px-5 py-2 border-b border-amber-200 bg-amber-50 shrink-0">
      <AlertCircle :size="13" class="text-amber-500 shrink-0" />
      <p class="text-xs text-amber-800 font-medium">
        Ce processus est en brouillon — les agents n'y ont pas encore accès. Publiez-le pour démarrer la collecte.
      </p>
    </div>

    <div class="flex flex-1 min-h-0 overflow-hidden">
      <ClientOnly>
        <WorkflowCanvas :steps="steps" />
        <template #fallback>
          <div class="flex-1 flex items-center justify-center text-sm text-text-quaternary bg-surface">
            Chargement du canvas…
          </div>
        </template>
      </ClientOnly>
      <StepConfigPanel />
      <WorkflowSettingsPanel />
      <SharePanel :workflow-id="workflow.id" :workflow-name="workflow.name" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted } from 'vue'
import { AlertCircle } from 'lucide-vue-next'
import { useWorkflowsStore } from '~/stores/workflows'
import { useAgentsStore } from '~/stores/agents'
import { useWorkflowBuilderStore } from '~/stores/workflow-builder'
import WorkflowCanvas from '~/components/workflow-canvas/WorkflowCanvas.vue'
import WorkflowToolbar from '~/components/workflow-canvas/WorkflowToolbar.vue'
import StepConfigPanel from '~/components/workflow-canvas/StepConfigPanel.vue'
import WorkflowSettingsPanel from '~/components/workflow-canvas/WorkflowSettingsPanel.vue'
import SharePanel from '~/components/workflow-canvas/SharePanel.vue'
import { workflowSteps } from '~/data/workflow-steps'

definePageMeta({ layout: 'app' })

const route   = useRoute()
const id      = computed(() => route.params.id as string)
const store   = useWorkflowsStore()
const agents  = useAgentsStore()
const builder = useWorkflowBuilderStore()

// Init synchrone : disponible côté serveur ET client
store.init()
agents.init()

const workflow = computed(() => store.workflows.find((w) => w.id === id.value) ?? null)
const steps    = computed(() => workflowSteps[id.value] ?? [])

useHead({
  title: computed(() => workflow.value ? `${workflow.value.name} — Tolbi Trace` : 'Tolbi Trace'),
})

if (import.meta.client) {
  const guardFn = (e: BeforeUnloadEvent) => {
    if (builder.hasUnsavedChanges) { e.preventDefault(); e.returnValue = '' }
  }
  window.addEventListener('beforeunload', guardFn)
  onUnmounted(() => window.removeEventListener('beforeunload', guardFn))
}
</script>
