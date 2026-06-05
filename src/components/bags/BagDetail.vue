<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden">

    <!-- Header -->
    <div class="flex items-start justify-between px-6 pt-6 pb-5 border-b border-border bg-surface shrink-0">
      <div class="flex items-start gap-4">
        <NuxtLink
          :to="`/source/workflows/${workflowId}/qr-codes`"
          class="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-text-tertiary hover:bg-white hover:text-text-secondary transition-colors mt-0.5 shrink-0"
        >
          <ArrowLeft :size="15" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl font-semibold text-text-primary font-mono leading-8 mb-1">{{ bag.code }}</h1>
          <p class="text-sm text-text-tertiary">
            <template v-if="bag.producerName">{{ bag.producerName }} · {{ bag.cooperativeName }}</template>
            <template v-else>Producteur non attribué</template>
          </p>
        </div>
      </div>

      <!-- Step progress chips -->
      <div class="flex items-center gap-1.5 shrink-0">
        <div
          v-for="i in TOTAL_STEPS"
          :key="i"
          :class="cn(
            'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors',
            stepState(i, bag.currentStep) === 'done'    && 'bg-primary text-white',
            stepState(i, bag.currentStep) === 'current' && 'bg-primary text-white ring-2 ring-primary/30',
            stepState(i, bag.currentStep) === 'pending' && 'bg-surface-alt text-text-quaternary border border-border',
          )"
        >
          {{ i }}
        </div>
        <span class="ml-2 text-sm text-text-tertiary">Étape {{ bag.currentStep }}/{{ TOTAL_STEPS }}</span>
      </div>
    </div>

    <main class="flex-1 overflow-y-auto px-6 py-6">
      <div class="max-w-3xl">

        <!-- Info card -->
        <div class="bg-white border border-border rounded-xl mb-8 flex items-stretch divide-x divide-border">
          <div class="flex-1 min-w-0 px-5 py-4">
            <p class="text-xs text-text-tertiary mb-1">Code QR</p>
            <p class="text-sm font-mono font-semibold text-text-primary">{{ bag.code }}</p>
          </div>
          <div class="flex-1 min-w-0 px-5 py-4">
            <p class="text-xs text-text-tertiary mb-1">Producteur</p>
            <p class="text-sm font-semibold text-text-primary">{{ bag.producerName ?? '—' }}</p>
          </div>
          <div class="flex-1 min-w-0 px-5 py-4">
            <p class="text-xs text-text-tertiary mb-1">Processus</p>
            <p class="text-sm font-semibold text-text-primary">Collecte maïs 2025</p>
          </div>
        </div>

        <!-- Timeline -->
        <div class="relative">
          <div class="absolute left-[15px] top-4 bottom-4 w-px bg-border" />

          <ol class="space-y-0">
            <li
              v-for="(_, i) in TOTAL_STEPS"
              :key="i"
              class="relative flex gap-5 pb-8 last:pb-0"
            >
              <div class="relative z-10 shrink-0 mt-0.5">
                <div
                  v-if="stepState(i + 1, bag.currentStep) === 'done'"
                  class="flex items-center justify-center w-[30px] h-[30px] rounded-full bg-primary"
                >
                  <CheckCircle2 :size="14" class="text-white" />
                </div>
                <div
                  v-else-if="stepState(i + 1, bag.currentStep) === 'current'"
                  class="flex items-center justify-center w-[30px] h-[30px] rounded-full bg-primary ring-4 ring-primary/15"
                >
                  <Clock :size="13" class="text-white" />
                </div>
                <div
                  v-else
                  class="flex items-center justify-center w-[30px] h-[30px] rounded-full bg-white border-2 border-border"
                >
                  <Circle :size="10" class="text-text-quaternary" />
                </div>
              </div>

              <div class="flex-1 min-w-0">
                <div :class="cn('flex items-center justify-between gap-2 mb-1', stepState(i + 1, bag.currentStep) === 'pending' && 'opacity-40')">
                  <p class="text-sm font-semibold text-text-primary">{{ STEP_NAMES[i] }}</p>
                  <span v-if="getEvent(i + 1)" class="text-xs text-text-quaternary shrink-0">{{ getEvent(i + 1)!.timestamp }}</span>
                </div>

                <div v-if="getEvent(i + 1)" class="bg-white border border-border rounded-lg px-4 py-3">
                  <p class="text-xs text-text-tertiary mb-2">{{ getEvent(i + 1)!.agentName }} · {{ getEvent(i + 1)!.agentRole }}</p>
                  <dl class="space-y-1.5">
                    <div
                      v-for="entry in getEvent(i + 1)!.entries"
                      :key="entry.label"
                      class="flex items-baseline justify-between gap-3"
                    >
                      <dt class="text-xs text-text-tertiary shrink-0">{{ entry.label }}</dt>
                      <dd class="text-xs font-semibold text-text-primary text-right">{{ entry.value }}</dd>
                    </div>
                  </dl>
                </div>
                <div v-else-if="stepState(i + 1, bag.currentStep) !== 'pending'" class="bg-white border border-border rounded-lg px-4 py-3">
                  <p class="text-xs text-text-quaternary">En cours de traitement…</p>
                </div>
                <p v-else class="text-xs text-text-quaternary mt-0.5">Non atteinte</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, CheckCircle2, Clock, Circle } from 'lucide-vue-next'
import { cn } from '~/lib/utils'
import type { QRCode } from '~/types/qr-code'
import type { BagEvent } from '~/types/bag-event'

const TOTAL_STEPS = 5
const STEP_NAMES = [
  'Collecte chez le producteur',
  'Pesée et contrôle humidité',
  'Chargement transport',
  'Réception entrepôt',
  'Contrôle qualité final',
]

const props = defineProps<{
  bag:        QRCode
  events:     BagEvent[]
  workflowId: string
}>()

function stepState(order: number, current: number) {
  if (order < current)  return 'done'
  if (order === current) return 'current'
  return 'pending'
}

function getEvent(order: number) {
  return props.events.find((e) => e.stepOrder === order) ?? null
}
</script>
