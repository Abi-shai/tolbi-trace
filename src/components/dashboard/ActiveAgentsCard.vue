<template>
  <div class="bg-white border border-border rounded-xl overflow-hidden">
    <div class="flex items-center justify-between px-5 py-4 border-b border-border">
      <div>
        <h2 class="text-sm font-semibold text-text-primary">Agents actifs</h2>
        <p class="text-xs text-text-tertiary mt-0.5">Sur le terrain aujourd'hui</p>
      </div>
      <span class="flex items-center justify-center w-6 h-6 rounded-full bg-green-50 text-green-700 text-xs font-bold">
        {{ agents.length }}
      </span>
    </div>

    <ul class="divide-y divide-border">
      <li v-for="agent in agents" :key="agent.id" class="px-5 py-3.5">
        <div class="flex items-start gap-3">
          <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-brand-50 shrink-0">
            <User :size="14" class="text-primary" />
            <span :class="cn('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white', STATUS_DOT[onlineStatus(agent.lastSeen)])" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <p class="text-sm font-semibold text-text-primary leading-tight">{{ agent.name }}</p>
              <span class="flex items-center gap-1 text-[11px] text-text-muted shrink-0">
                <Clock :size="9" />
                {{ agent.lastSeen }}
              </span>
            </div>
            <p class="text-xs text-text-tertiary truncate mt-0.5">{{ agent.currentStep }}</p>
            <div class="mt-2 flex items-center gap-2">
              <div class="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                <div class="h-full bg-primary rounded-full transition-all" :style="{ width: `${pct(agent)}%` }" />
              </div>
              <span class="text-[11px] font-semibold text-text-secondary tabular-nums">{{ pct(agent) }}%</span>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { User, Clock } from 'lucide-vue-next'
import { cn } from '~/lib/utils'
import type { ActiveAgent } from '~/data/dashboard'

defineProps<{ agents: ActiveAgent[] }>()

const STATUS_DOT: Record<string, string> = {
  online:  'bg-green-500',
  away:    'bg-orange-400',
  offline: 'bg-status-offline',
}

function parseMinutesAgo(lastSeen: string): number {
  const m = lastSeen.match(/Il y a (\d+) min/)
  return m ? parseInt(m[1], 10) : 999
}

function onlineStatus(lastSeen: string): 'online' | 'away' | 'offline' {
  const min = parseMinutesAgo(lastSeen)
  if (min <= 10) return 'online'
  if (min <= 25) return 'away'
  return 'offline'
}

function pct(agent: ActiveAgent): number {
  return Math.min(100, Math.round((agent.bagsScanned / agent.bagsTarget) * 100))
}
</script>
