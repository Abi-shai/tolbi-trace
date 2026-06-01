<template>
  <header
    class="flex items-center justify-between px-4 py-3 shrink-0 w-full"
    style="background-color: rgba(6, 105, 56, 0.95)"
  >
    <!-- Left: logo + breadcrumbs -->
    <div :class="`flex items-center ${breadcrumbs.length > 0 ? 'gap-8' : ''}`">
      <img
        :src="'/icons/tolbi-wordmark.svg'"
        alt="Tolbi"
        width="47"
        height="20"
        class="shrink-0 select-none"
      />

      <nav v-if="breadcrumbs.length > 0" class="flex items-center gap-1">
        <NuxtLink
          to="/"
          class="flex items-center justify-center p-1.5 rounded-[6px] text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Home :size="15" />
        </NuxtLink>

        <span v-for="(crumb, i) in breadcrumbs" :key="i" class="flex items-center gap-1">
          <ChevronRight :size="13" class="text-white/30 shrink-0" />
          <NuxtLink
            v-if="crumb.href"
            :to="crumb.href"
            class="px-2 py-1 rounded-[6px] text-text-disabled text-sm font-medium leading-5 hover:text-white transition-colors whitespace-nowrap"
          >
            {{ crumb.label }}
          </NuxtLink>
          <span v-else class="px-2 py-1 rounded-[6px] bg-primary text-border text-sm font-semibold leading-5 max-w-[220px] truncate">
            {{ crumb.label }}
          </span>
        </span>
      </nav>
    </div>

    <!-- Right: credits badge + actions + avatar -->
    <div class="flex items-center gap-4 shrink-0">

      <!-- Credits badge -->
      <div class="flex items-center gap-2 px-2.5 pr-3 py-1 rounded-full bg-warning-bg">
        <img :src="'/icons/token-coin.png'" alt="" class="w-[17px] h-[17px] rounded-full shrink-0 object-cover" />
        <p class="text-sm leading-6 whitespace-nowrap">
          <span class="font-bold text-brand-700">32</span>
          <span class="font-medium text-text-secondary"> crédits disponibles</span>
        </p>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-1">
        <button
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-border text-sm font-semibold border border-primary shadow-sm hover:bg-primary transition-colors"
          style="background-color: rgba(5, 96, 51, 0.9)"
        >
          <BookOpen :size="16" />
          Apprendre
        </button>

        <button class="flex items-center justify-center p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors">
          <Settings :size="18" />
        </button>

        <div class="relative">
          <button class="flex items-center justify-center p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <Bell :size="18" />
          </button>
          <div class="absolute top-[14px] right-[14px] w-1.5 h-1.5 rounded-full bg-status-anomaly border-[1.5px] border-border pointer-events-none" />
        </div>

        <button class="flex items-center justify-center p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors">
          <LayoutGrid :size="18" />
        </button>
      </div>

      <!-- Avatar -->
      <button class="w-10 h-10 rounded-full bg-surface-alt border border-black/[0.08] flex items-center justify-center shrink-0 hover:ring-2 hover:ring-white/30 transition-all">
        <span class="text-sm font-semibold text-text-muted">AG</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Home, ChevronRight, Bell, Settings, BookOpen, LayoutGrid } from 'lucide-vue-next'
import { useWorkflowsStore } from '~/stores/workflows'

interface Crumb {
  label: string
  href?: string
}

const SUB_LABELS: Record<string, string> = {
  'qr-codes': 'QR Codes',
  graphe:     'Traçabilité',
  sacs:       'Détail QR code',
  agents:     'Équipe',
}

const route    = useRoute()
const store    = useWorkflowsStore()

const breadcrumbs = computed<Crumb[]>(() => {
  const pathname = route.path
  const segments = pathname.split('/').filter(Boolean)

  if (segments[0] !== 'workflows') return []

  if (segments.length === 1) return [{ label: 'Trace' }]

  const wf     = store.workflows.find((w) => w.id === segments[1])
  const wfName = wf?.name ?? segments[1]
  const wfHref = `/workflows/${segments[1]}`

  if (segments.length === 2) {
    return [{ label: 'Trace', href: '/workflows' }, { label: wfName }]
  }

  const sub      = segments[2]
  const subLabel = SUB_LABELS[sub] ?? sub

  if (segments.length === 3) {
    return [
      { label: 'Trace',  href: '/workflows' },
      { label: wfName,   href: wfHref       },
      { label: subLabel                      },
    ]
  }

  return [
    { label: 'Trace',    href: '/workflows'       },
    { label: wfName,     href: wfHref             },
    { label: subLabel,   href: `${wfHref}/${sub}` },
    { label: segments[3]                           },
  ]
})
</script>
