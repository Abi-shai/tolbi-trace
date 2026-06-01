<template>
  <div class="bg-white border border-border rounded-xl p-4">

    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <p class="text-lg font-semibold text-text-primary leading-7 shrink-0">Progression de la campagne</p>
      <span class="flex items-center px-2 py-0.5 rounded-full border text-xs font-medium bg-warning-bg border-warning-border text-warning-text">
        En cours
      </span>
    </div>

    <!-- Stepper -->
    <div class="relative w-full">

      <!-- Track -->
      <div
        class="absolute h-[2px] bg-border overflow-hidden"
        :style="{ top: '12px', left: '12px', right: '12px' }"
      >
        <div
          v-if="greenPct > 0"
          class="h-full bg-primary transition-all duration-500"
          :style="{ width: `${greenPct}%` }"
        />
      </div>

      <!-- Circles -->
      <div class="flex justify-between relative z-10">
        <div
          v-for="(step, i) in stepProgress"
          :key="step.stepId"
          :class="cn(
            'relative w-6 h-6 rounded-full overflow-hidden shrink-0',
            (statuses[i] === 'complete' || statuses[i] === 'active') ? 'bg-[#e6f0eb]' : 'bg-surface',
            i === glowIdx && 'shadow-[0px_0px_0px_4px_rgba(5,96,51,0.24)]',
          )"
        >
          <div v-if="statuses[i] === 'complete'" class="absolute inset-0 rounded-full bg-primary flex items-center justify-center">
            <Check :size="12" class="text-white" :stroke-width="2.5" />
          </div>
          <div v-else-if="statuses[i] === 'active'" class="absolute inset-0 rounded-full bg-primary flex items-center justify-center">
            <span class="w-2 h-2 rounded-full bg-white" />
          </div>
          <div v-else class="absolute inset-0 rounded-full border-[1.5px] border-border flex items-center justify-center">
            <span class="w-2 h-2 rounded-full bg-status-offline" />
          </div>
        </div>
      </div>

      <!-- Labels -->
      <div class="flex justify-between mt-3">
        <div
          v-for="(step, i) in stepProgress"
          :key="step.stepId"
          :class="cn('w-6 flex flex-col gap-1', i === 0 ? 'items-start text-left' : i === n - 1 ? 'items-end text-right' : 'items-center text-center')"
        >
          <p :class="cn(
            'text-sm font-semibold leading-5 whitespace-nowrap',
            i === glowIdx ? 'text-brand-700' : statuses[i] === 'upcoming' ? 'text-[#98a2b3]' : 'text-text-secondary',
          )">
            {{ SHORT_NAMES[i] }}
          </p>
          <p :class="cn(
            'text-sm leading-5 whitespace-nowrap',
            i === glowIdx ? 'text-[#056033]' : statuses[i] === 'upcoming' ? 'text-text-disabled' : 'text-text-tertiary',
          )">
            {{ STEP_DATES[i] }}
          </p>
          <p :class="cn(
            'text-xs tabular-nums whitespace-nowrap',
            i === glowIdx ? 'text-[#056033] font-medium' :
            statuses[i] === 'complete' ? 'text-primary font-medium' :
            statuses[i] === 'active'   ? 'text-text-tertiary' : 'text-text-disabled',
          )">
            {{ bagCountLabel(step.order, step.bagsCompleted, step.bagsInProgress, step.bagsTotal) }}
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Check } from 'lucide-vue-next'
import { cn } from '~/lib/utils'
import { stepProgress } from '~/data/dashboard'

const SHORT_NAMES = ['Collecte', 'Pesée', 'Chargement', 'Réception', 'Contrôle final']
const STEP_DATES  = ['12 nov.', '13 nov.', '14 nov.', '15 nov.', '14 nov.']

type StepStatus = 'complete' | 'active' | 'upcoming'

function getStatus(bagsCompleted: number, bagsInProgress: number): StepStatus {
  if (bagsInProgress > 0) return 'active'
  if (bagsCompleted > 0)  return 'complete'
  return 'upcoming'
}

function bagCountLabel(order: number, completed: number, inProgress: number, total: number): string {
  const status = getStatus(completed, inProgress)
  if (status === 'upcoming') return 'En attente'
  if (order === 1)           return `${completed + inProgress} QR codes`
  if (status === 'complete') return `${completed} QR codes validés`
  return `${completed} / ${total} QR codes`
}

const n        = stepProgress.length
const statuses = computed(() => stepProgress.map((s) => getStatus(s.bagsCompleted, s.bagsInProgress)))

const lastFilledIdx = computed(() =>
  statuses.value.reduce((last, s, i) => (s !== 'upcoming' ? i : last), -1),
)

const greenPct = computed(() =>
  lastFilledIdx.value >= 0 ? (lastFilledIdx.value / (n - 1)) * 100 : 0,
)

const glowIdx = computed(() =>
  statuses.value.reduce((last, s, i) => (s === 'active' ? i : last), -1),
)
</script>
