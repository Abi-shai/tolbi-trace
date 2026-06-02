<template>
  <div class="bg-white border border-border rounded-xl overflow-hidden">
    <div class="flex items-center justify-between px-5 py-4 border-b border-border">
      <div>
        <h2 class="text-sm font-semibold text-text-primary">Agents en ce moment</h2>
        <p class="text-xs text-text-tertiary mt-0.5">Activité terrain en temps réel</p>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span class="text-xs font-medium text-green-700">{{ agents.length }} actifs</span>
      </div>
    </div>

    <ul class="divide-y divide-border">
      <li
        v-for="agent in agents"
        :key="agent.id"
        :class="cn('px-5 py-4', statusOf(agent.lastSeen) === 'silent' && 'bg-orange-50/40')"
      >
        <div class="flex items-start gap-3">

          <!-- Avatar + status dot -->
          <div class="relative shrink-0">
            <div :class="cn('flex items-center justify-center w-9 h-9 rounded-full', statusOf(agent.lastSeen) === 'silent' ? 'bg-[#fff3e0]' : 'bg-brand-50')">
              <WifiOff v-if="statusOf(agent.lastSeen) === 'silent'" :size="14" class="text-orange-500" />
              <User v-else :size="14" class="text-primary" />
            </div>
            <span :class="cn('absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white', STATUS_DOT[statusOf(agent.lastSeen)])" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="text-sm font-semibold text-text-primary leading-tight">{{ agent.name }}</p>
                <p class="text-xs text-text-tertiary truncate mt-0.5">{{ agent.currentStep }}</p>
              </div>
              <div :class="cn('flex items-center gap-1 shrink-0 text-[11px]', statusOf(agent.lastSeen) === 'silent' ? 'text-orange-600 font-semibold' : 'text-text-quaternary')">
                <Clock :size="10" />
                {{ agent.lastSeen }}
              </div>
            </div>

            <div v-if="statusOf(agent.lastSeen) === 'silent'" class="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-100 border border-orange-200 rounded-lg">
              <WifiOff :size="11" class="text-orange-600 shrink-0" />
              <p class="text-xs font-semibold text-orange-700">
                Silencieux depuis {{ parseMinutesAgo(agent.lastSeen) }} min — aucun scan enregistré
              </p>
            </div>

            <div class="mt-2.5 space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-[11px] text-text-quaternary">{{ agent.bagsScanned }} / {{ agent.bagsTarget }} QR codes aujourd'hui</span>
                <span :class="cn('text-[11px] font-semibold', pct(agent) >= 75 ? 'text-primary' : pct(agent) >= 50 ? 'text-text-secondary' : 'text-orange-500')">
                  {{ pct(agent) }}%
                </span>
              </div>
              <div class="h-1.5 bg-surface rounded-full overflow-hidden">
                <div
                  :class="cn('h-full rounded-full transition-all duration-500', pct(agent) >= 75 ? 'bg-primary' : 'bg-orange-400')"
                  :style="{ width: `${pct(agent)}%` }"
                />
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { User, Clock, WifiOff } from 'lucide-vue-next'
import { cn } from '~/lib/utils'
import type { ActiveAgent } from '~/data/dashboard'

defineProps<{ agents: ActiveAgent[] }>()

const STATUS_DOT: Record<string, string> = {
  active: 'bg-green-500',
  idle:   'bg-orange-400',
  silent: 'bg-status-offline',
}

function parseMinutesAgo(lastSeen: string): number {
  const m = lastSeen.match(/Il y a (\d+) min/)
  return m ? parseInt(m[1], 10) : 999
}

function statusOf(lastSeen: string): 'active' | 'idle' | 'silent' {
  const min = parseMinutesAgo(lastSeen)
  if (min <= 10) return 'active'
  if (min <= 20) return 'idle'
  return 'silent'
}

function pct(agent: ActiveAgent): number {
  return Math.min(100, Math.round((agent.bagsScanned / agent.bagsTarget) * 100))
}
</script>
