<template>
  <div class="bg-white border border-border rounded-xl overflow-hidden">
    <div class="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
      <div>
        <h2 class="text-sm font-semibold text-text-primary">Progression par étape</h2>
        <p class="text-xs text-text-tertiary mt-0.5">QR codes validés et en cours</p>
      </div>
      <span class="text-[11px] text-text-muted shrink-0">Sync il y a 2 min</span>
    </div>

    <div class="divide-y divide-border">
      <div v-for="step in steps" :key="step.stepId" class="px-5 py-4">
        <div class="flex items-start justify-between gap-4 mb-3">
          <div class="flex items-center gap-3 min-w-0">
            <span class="flex items-center justify-center w-6 h-6 rounded-full bg-brand-50 text-primary text-xs font-bold shrink-0">{{ step.order }}</span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-text-primary truncate">{{ step.name }}</p>
              <p class="text-xs text-text-tertiary">{{ step.agentRole }}</p>
            </div>
          </div>
          <div class="shrink-0 text-right">
            <span v-if="step.bagsTotal > 0" class="text-xs text-text-tertiary">
              <span class="font-semibold text-text-primary">{{ step.bagsCompleted }}</span>/{{ step.bagsTotal }} QR codes
            </span>
            <span v-else class="text-xs text-text-tertiary">
              <span class="font-semibold text-text-primary">{{ step.bagsCompleted + step.bagsInProgress }}</span> enregistrés
            </span>
          </div>
        </div>

        <div v-if="step.bagsTotal > 0" class="h-2 bg-surface-alt rounded-full overflow-hidden">
          <div class="h-full flex">
            <div
              v-if="pct(step) > 0"
              class="h-full bg-primary rounded-l-full transition-all"
              :style="{ width: `${pct(step)}%` }"
            />
            <div
              v-if="inProgressPct(step) > 0"
              :class="cn('h-full bg-orange-400 transition-all', pct(step) === 0 && 'rounded-l-full')"
              :style="{ width: `${inProgressPct(step)}%` }"
            />
          </div>
        </div>

        <div :class="cn('flex items-center gap-4', step.bagsTotal > 0 ? 'mt-2' : '')">
          <span class="flex items-center gap-1.5 text-xs text-text-tertiary">
            <span class="w-2 h-2 rounded-full bg-primary inline-block" />
            {{ step.bagsCompleted }} validés
          </span>
          <span v-if="step.bagsInProgress > 0" class="flex items-center gap-1.5 text-xs text-text-tertiary">
            <span class="w-2 h-2 rounded-full bg-orange-400 inline-block" />
            {{ step.bagsInProgress }} en cours
          </span>
          <span v-if="step.bagsTotal > 0" class="ml-auto text-xs font-semibold text-text-secondary">{{ pct(step) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { cn } from '~/lib/utils'
import type { StepProgress } from '~/data/dashboard'

defineProps<{ steps: StepProgress[] }>()

function pct(step: StepProgress): number {
  return step.bagsTotal > 0 ? Math.round((step.bagsCompleted / step.bagsTotal) * 100) : 0
}

function inProgressPct(step: StepProgress): number {
  return step.bagsTotal > 0 ? Math.round((step.bagsInProgress / step.bagsTotal) * 100) : 0
}
</script>
