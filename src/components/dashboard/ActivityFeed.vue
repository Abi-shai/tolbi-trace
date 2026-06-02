<template>
  <div class="bg-white border border-border rounded-xl overflow-hidden">

    <!-- Header collapsible -->
    <button
      @click="expanded = !expanded"
      class="w-full flex items-center justify-between px-5 py-4 border-b border-border hover:bg-surface transition-colors text-left"
    >
      <div>
        <h2 class="text-sm font-semibold text-text-primary">Historique d'activité</h2>
        <p class="text-xs text-text-tertiary mt-0.5">Contexte chronologique des activités</p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <span v-if="activeFilters.length > 0" class="text-[10px] font-semibold px-1.5 py-0.5 bg-brand-50 text-primary border border-primary/20 rounded-full">
          {{ activeFilters.length }} filtre{{ activeFilters.length > 1 ? 's' : '' }}
        </span>
        <span class="text-xs text-text-quaternary">{{ filtered.length }} év.</span>
        <ChevronDown :size="14" :class="cn('text-text-quaternary transition-transform', expanded && 'rotate-180')" />
      </div>
    </button>

    <template v-if="expanded">
      <!-- Filtres -->
      <div class="px-5 py-3 border-b border-border bg-surface space-y-2">
        <div class="flex items-center gap-2.5 flex-wrap">
          <select v-model="filterStep"   class="px-3 py-1.5 text-xs border border-border-strong rounded-lg bg-white text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none cursor-pointer">
            <option value="">Toutes les étapes</option>
            <option v-for="name in STEP_NAMES" :key="name" :value="name">{{ name }}</option>
          </select>
          <select v-model="filterAgent"  class="px-3 py-1.5 text-xs border border-border-strong rounded-lg bg-white text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none cursor-pointer">
            <option value="">Tous les agents</option>
            <option v-for="name in agentNames" :key="name" :value="name">{{ name }}</option>
          </select>
          <select v-model="filterAction" class="px-3 py-1.5 text-xs border border-border-strong rounded-lg bg-white text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none cursor-pointer">
            <option value="">Tous les statuts</option>
            <option value="validated">Validé</option>
            <option value="started">Démarré</option>
          </select>
          <button v-if="activeFilters.length > 0" @click="clearAll" class="text-xs text-text-quaternary hover:text-text-secondary transition-colors ml-auto">
            Effacer
          </button>
        </div>
      </div>

      <!-- Feed -->
      <div v-if="filtered.length === 0" class="px-5 py-8 text-center">
        <p class="text-sm text-text-quaternary">Aucun événement correspondant</p>
      </div>
      <ul v-else class="divide-y divide-border">
        <li v-for="event in filtered" :key="event.id" class="flex items-start gap-3 px-5 py-3">
          <div :class="cn('flex items-center justify-center w-7 h-7 rounded-lg shrink-0 mt-0.5', ACTION_CONFIG[event.action].bg)">
            <component :is="ACTION_CONFIG[event.action].icon" :size="13" :class="ACTION_CONFIG[event.action].color" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-mono font-semibold text-text-primary">{{ event.bagCode }}</span>
              <span class="text-xs text-text-quaternary shrink-0">{{ event.timestamp }}</span>
            </div>
            <p class="text-xs text-text-secondary mt-0.5">{{ ACTION_LABELS[event.action] }} — {{ event.stepName }}</p>
            <p class="text-xs text-text-tertiary">par {{ event.agentName }}</p>
          </div>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronDown, CheckCircle2, PlayCircle } from 'lucide-vue-next'
import { cn } from '~/lib/utils'
import { stepProgress, type RecentEvent } from '~/data/dashboard'

const props = withDefaults(defineProps<{
  events:           RecentEvent[]
  defaultExpanded?: boolean
}>(), {
  defaultExpanded: true,
})

const ACTION_CONFIG = {
  validated: { label: 'Étape validée',  icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  started:   { label: 'Étape démarrée', icon: PlayCircle,   color: 'text-primary',  bg: 'bg-brand-50' },
}
const ACTION_LABELS: Record<RecentEvent['action'], string> = {
  validated: 'Validé',
  started:   'Démarré',
}
const STEP_NAMES = stepProgress.map((s) => s.name)

const expanded     = ref(props.defaultExpanded)
const filterStep   = ref('')
const filterAgent  = ref('')
const filterAction = ref<RecentEvent['action'] | ''>('')

const agentNames = computed(() => [...new Set(props.events.map((e) => e.agentName))])

const filtered = computed(() => props.events.filter((ev) => {
  if (filterStep.value   && ev.stepName  !== filterStep.value)   return false
  if (filterAgent.value  && ev.agentName !== filterAgent.value)  return false
  if (filterAction.value && ev.action    !== filterAction.value) return false
  return true
}))

const activeFilters = computed(() => [
  filterStep.value   && { key: 'step',  label: filterStep.value },
  filterAgent.value  && { key: 'agent', label: filterAgent.value },
  filterAction.value && { key: 'act',   label: ACTION_LABELS[filterAction.value] },
].filter(Boolean))

function clearAll() {
  filterStep.value = ''
  filterAgent.value = ''
  filterAction.value = ''
}
</script>
