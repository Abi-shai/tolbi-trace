<template>
  <!-- Badge « accès module » — fidèle au Figma (node 1063) : pilule pl-3 pr-2 py-0.5,
       icône module couleur (DsModuleIcon 16px) + libellé 12px. Deux formes (ADR-0014) :
       avec `level` (Lecteur vert / Éditeur ambre) pour l'accès porté par un rôle ;
       sans `level` (neutre, libellé = module) pour le grant binaire d'un agent. -->
  <span
    class="inline-flex shrink-0 items-center gap-1 rounded-full border py-0.5 pl-[3px] pr-2"
    :class="cls"
    :title="level ? `${moduleName} · ${label}` : moduleName"
  >
    <DsModuleIcon :module="moduleIcon" :size="16" class="rounded-full" />
    <span class="whitespace-nowrap text-xs font-medium leading-[18px]">{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ACCESS_LEVEL_LABELS, type AccessLevel } from '~/types/organisation'
import { moduleDef } from '~/data/modules'

const props = defineProps<{ moduleId: string; level?: AccessLevel }>()

const def        = computed(() => moduleDef(props.moduleId))
const moduleIcon = computed(() => def.value?.moduleIcon ?? 'Data')
const moduleName = computed(() => def.value?.name ?? props.moduleId)
const label      = computed(() => props.level ? ACCESS_LEVEL_LABELS[props.level] : (def.value?.short ?? props.moduleId))

const cls = computed(() => props.level
  ? {
      lecteur: 'bg-[var(--ds-color-success-50)] border-[#abefc6] text-[var(--ds-color-success-700)]',
      editeur: 'bg-[var(--ds-color-warning-50)] border-[var(--ds-color-warning-200)] text-[var(--ds-color-warning-700)]',
    }[props.level]
  : 'border-border bg-white text-text-secondary')
</script>
