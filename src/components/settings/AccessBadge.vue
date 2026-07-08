<template>
  <!-- Badge « accès module » — fidèle au Figma (node 1063) : pilule pl-3 pr-2 py-0.5,
       icône module couleur (DsModuleIcon 16px) + libellé de niveau 12px, couleurs
       success/warning/error 50-200-700 selon le niveau. -->
  <span
    class="inline-flex shrink-0 items-center gap-1 rounded-full border py-0.5 pl-[3px] pr-2"
    :class="cls"
    :title="`${moduleName} · ${label}`"
  >
    <DsModuleIcon :module="moduleIcon" :size="16" class="rounded-full" />
    <span class="whitespace-nowrap text-xs font-medium leading-[18px]">{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ACCESS_LEVEL_LABELS, type AccessLevel } from '~/types/organisation'
import { moduleDef } from '~/data/modules'

const props = defineProps<{ moduleId: string; level: AccessLevel }>()

const def        = computed(() => moduleDef(props.moduleId))
const moduleIcon = computed(() => def.value?.moduleIcon ?? 'Data')
const moduleName = computed(() => def.value?.name ?? props.moduleId)
const label      = computed(() => ACCESS_LEVEL_LABELS[props.level])

const cls = computed(() => ({
  lecteur: 'bg-[#ecfdf3] border-[#abefc6] text-[#067647]',
  editeur: 'bg-[#fffaeb] border-[#fedf89] text-[#b54708]',
  admin:   'bg-[#fef3f2] border-[#fecdca] text-[#b42318]',
}[props.level]))
</script>
