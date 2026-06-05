<template>
  <NuxtLink
    :to="`/source/workflows/${workflow.id}`"
    class="block bg-white border border-border rounded-lg p-5 hover:border-border-strong hover:shadow-[0px_1px_4px_rgba(16,24,40,0.08)] transition-all cursor-pointer"
  >
    <!-- Titre + badge -->
    <div class="flex items-start justify-between gap-4 mb-2">
      <h2 class="text-sm font-semibold text-text-primary leading-5 min-w-0 truncate">{{ workflow.name }}</h2>
      <DsBadge :color="STATUS_CONFIG[workflow.status].color" :label="STATUS_CONFIG[workflow.status].label" size="sm" />
    </div>

    <!-- Description -->
    <p class="text-sm text-text-tertiary leading-5 line-clamp-2 mb-4">{{ workflow.description }}</p>

    <!-- Métadonnées -->
    <div class="flex items-center justify-between text-xs text-text-tertiary">
      <div class="flex items-center gap-4">
        <span class="flex items-center gap-1.5">
          <Layers :size="13" class="text-text-quaternary" />
          {{ workflow.stepCount }} étape{{ workflow.stepCount > 1 ? 's' : '' }}
        </span>
      </div>
      <span class="text-text-quaternary">Créé le {{ formatDate(workflow.createdAt) }}</span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { Layers } from 'lucide-vue-next'
import type { Workflow, WorkflowStatus } from '~/types/workflow'

defineProps<{ workflow: Workflow }>()

const STATUS_CONFIG: Record<WorkflowStatus, { label: string; color: string }> = {
  active: { label: 'Actif',     color: 'success' },
  draft:  { label: 'Brouillon', color: 'gray'    },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}
</script>
