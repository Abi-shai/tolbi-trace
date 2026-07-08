<template>
  <!-- Picker d'accès par module (Figma « sélection de modules ») : une ligne par
       module ; on déplie pour choisir le niveau (Lecteur/Éditeur/Admin, sélection
       unique). Les modules hors offre s'affichent désactivés. Le DS n'a pas de
       radio → radio custom minimal, fidèle au Figma. -->
  <div class="flex flex-col gap-1.5">
    <template v-for="m in MODULES" :key="m.id">
      <!-- Module inclus dans l'offre -->
      <div
        v-if="isEnabled(m.id)"
        class="rounded-lg transition-colors"
        :class="expandedId === m.id ? 'bg-primary/[0.06]' : 'hover:bg-surface'"
      >
        <button
          type="button"
          class="flex w-full items-center gap-2.5 px-3 py-2.5 text-left"
          @click="toggle(m.id)"
        >
          <DsModuleIcon :module="m.moduleIcon" :size="24" class="shrink-0" />
          <span class="flex-1 truncate text-sm font-semibold text-text-secondary">{{ m.name }}</span>
          <DsBadge
            v-if="modelValue[m.id] && expandedId !== m.id"
            :label="ACCESS_LEVEL_LABELS[modelValue[m.id]]"
            :color="ACCESS_BADGE_COLOR[modelValue[m.id]]"
            variant="pill-color"
            size="sm"
          />
          <ChevronDown
            :size="18"
            class="shrink-0 text-text-quaternary transition-transform"
            :class="expandedId === m.id && 'rotate-180'"
          />
        </button>

        <!-- Niveaux (radio) -->
        <div v-if="expandedId === m.id" class="flex flex-col gap-2 px-3 pb-3 pl-[42px]">
          <button
            v-for="lvl in ACCESS_LEVELS"
            :key="lvl.value"
            type="button"
            class="flex items-start gap-2.5 text-left"
            @click="setLevel(m.id, lvl.value)"
          >
            <span
              class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors"
              :class="modelValue[m.id] === lvl.value ? 'bg-primary' : 'border border-border-strong bg-white'"
            >
              <span v-if="modelValue[m.id] === lvl.value" class="h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            <span class="flex flex-col">
              <span class="text-sm font-medium text-text-secondary">{{ lvl.label }}</span>
              <span class="text-xs text-text-tertiary">{{ lvl.description }}</span>
            </span>
          </button>

          <button
            v-if="modelValue[m.id]"
            type="button"
            class="mt-1 w-fit text-xs font-semibold text-text-tertiary hover:text-text-secondary"
            @click="clear(m.id)"
          >
            Retirer l'accès
          </button>
        </div>
      </div>

      <!-- Module hors offre : désactivé -->
      <div
        v-else
        class="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2.5 opacity-60"
        title="Module non inclus dans l'offre de cette organisation"
      >
        <DsModuleIcon :module="m.moduleIcon" :size="24" class="shrink-0 grayscale" />
        <span class="flex-1 truncate text-sm font-semibold text-text-disabled">{{ m.name }}</span>
        <span class="text-xs text-text-quaternary">Hors offre</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { MODULES } from '~/data/modules'
import {
  ACCESS_LEVELS,
  ACCESS_LEVEL_LABELS,
  ACCESS_BADGE_COLOR,
  type AccessLevel,
  type ModuleAccess,
} from '~/types/organisation'

const props = defineProps<{
  modelValue:     ModuleAccess
  enabledModules: string[]
}>()

const emit = defineEmits<{ 'update:modelValue': [ModuleAccess] }>()

const expandedId = ref<string | null>(null)

function isEnabled(id: string) {
  return props.enabledModules.includes(id)
}
function toggle(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}
function setLevel(id: string, level: AccessLevel) {
  emit('update:modelValue', { ...props.modelValue, [id]: level })
}
function clear(id: string) {
  const next = { ...props.modelValue }
  delete next[id]
  emit('update:modelValue', next)
}
</script>
