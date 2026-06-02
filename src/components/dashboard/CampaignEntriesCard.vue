<template>
  <div class="bg-white border border-border rounded-xl overflow-hidden flex flex-col">

    <!-- Header -->
    <div class="px-5 py-4 border-b border-border flex items-center gap-3">
      <div class="flex-1 min-w-0">
        <h2 class="text-sm font-semibold text-text-primary">Informations sur la campagne</h2>
        <p class="text-xs text-text-tertiary mt-0.5">Activité récente par étape</p>
      </div>
      <button
        @click="handleRefresh"
        class="flex items-center justify-center w-7 h-7 rounded-lg text-text-quaternary hover:text-text-secondary hover:bg-surface transition-colors shrink-0"
      >
        <RefreshCw :size="13" :class="spinning && 'animate-spin'" />
      </button>
    </div>

    <!-- Tab bar -->
    <div class="flex items-center gap-0 px-5 pt-3 border-b border-border overflow-x-auto">
      <button
        @click="activeStepId = 'all'"
        :class="cn('shrink-0 px-3 pb-3 text-xs font-semibold border-b-2 transition-colors', activeStepId === 'all' ? 'text-primary border-primary' : 'text-text-quaternary border-transparent hover:text-text-secondary')"
      >
        Tous
        <span class="ml-1.5 px-1.5 py-0.5 bg-surface rounded text-[10px] text-text-tertiary font-normal">
          {{ recentEvents.length }}
        </span>
      </button>
      <button
        v-for="(step, i) in stepProgress"
        :key="step.stepId"
        @click="activeStepId = step.stepId"
        :class="cn('shrink-0 px-3 pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5', activeStepId === step.stepId ? 'text-primary border-primary' : 'text-text-quaternary border-transparent hover:text-text-secondary')"
      >
        {{ SHORT_NAMES[i] }}
        <span v-if="step.bagsInProgress > 0" class="w-1.5 h-1.5 rounded-full bg-primary" />
      </button>
    </div>

    <!-- Events list -->
    <div class="flex-1 overflow-y-auto divide-y divide-border max-h-[400px]">
      <div
        v-for="event in filtered"
        :key="event.id"
        class="px-5 py-3 flex items-center gap-3"
      >
        <div :class="cn('flex items-center justify-center w-7 h-7 rounded-full shrink-0', ACTION_CONFIG[event.action].bg)">
          <component :is="ACTION_CONFIG[event.action].icon" :size="13" :class="ACTION_CONFIG[event.action].color" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-text-primary truncate">{{ event.bagCode }}</p>
          <p class="text-[11px] text-text-tertiary truncate">{{ event.agentName }} · {{ event.stepName }}</p>
        </div>
        <span class="text-[11px] text-text-quaternary shrink-0 tabular-nums">{{ event.time }}</span>
      </div>

      <div v-if="filtered.length === 0" class="px-5 py-8 text-center">
        <p class="text-sm text-text-quaternary">Aucune activité pour cette étape</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RefreshCw, CheckCircle2, PlayCircle } from 'lucide-vue-next'
import { cn } from '~/lib/utils'
import { stepProgress, recentEvents } from '~/data/dashboard'

const SHORT_NAMES = ['Collecte', 'Pesée', 'Chargement', 'Réception', 'Contrôle final']

const ACTION_CONFIG = {
  validated: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  started:   { icon: PlayCircle,   color: 'text-primary',  bg: 'bg-brand-50' },
}

const activeStepId = ref<string>('all')
const spinning     = ref(false)

const filtered = computed(() => {
  if (activeStepId.value === 'all') return recentEvents
  const activeStep = stepProgress.find((s) => s.stepId === activeStepId.value)
  if (!activeStep) return []
  return recentEvents.filter((e) => e.stepName === activeStep.name)
})

function handleRefresh() {
  spinning.value = true
  setTimeout(() => { spinning.value = false }, 600)
}
</script>
