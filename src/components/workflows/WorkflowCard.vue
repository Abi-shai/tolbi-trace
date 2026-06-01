<template>
  <NuxtLink
    :to="`/workflows/${workflow.id}`"
    class="block bg-white border border-border rounded-lg p-5 hover:border-border-strong hover:shadow-[0px_1px_4px_rgba(16,24,40,0.08)] transition-all cursor-pointer"
  >
    <!-- Titre + badge -->
    <div class="flex items-start justify-between gap-4 mb-2">
      <h2 class="text-sm font-semibold text-text-primary leading-5 min-w-0 truncate">{{ workflow.name }}</h2>
      <Badge :variant="STATUS_CONFIG[workflow.status].variant">{{ STATUS_CONFIG[workflow.status].label }}</Badge>
    </div>

    <!-- Description -->
    <p class="text-sm text-text-tertiary leading-5 line-clamp-2 mb-4">{{ workflow.description }}</p>

    <!-- Métadonnées -->
    <div class="flex items-center justify-between text-xs text-text-tertiary">
      <div class="flex items-center gap-4">
        <span class="flex items-center gap-1.5">
          <Layers :size="13" class="text-text-muted" />
          {{ workflow.stepCount }} étape{{ workflow.stepCount > 1 ? 's' : '' }}
        </span>
      </div>
      <span class="text-text-muted">Créé le {{ formatDate(workflow.createdAt) }}</span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { Layers } from 'lucide-vue-next'
import type { Workflow, WorkflowStatus } from '~/types/workflow'
import Badge from '~/components/ui/Badge.vue'

defineProps<{ workflow: Workflow }>()

const STATUS_CONFIG: Record<WorkflowStatus, { label: string; variant: 'success' | 'neutral' }> = {
  active: { label: 'Actif',     variant: 'success'  },
  draft:  { label: 'Brouillon', variant: 'neutral'  },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}
</script>
