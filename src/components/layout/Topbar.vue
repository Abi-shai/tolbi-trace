<template>
  <DsHNav
    :state="navState"
    :breadcrumbs="dsBreadcrumbs"
    :credits="32"
    credit-state="good"
    credit-context="home"
    user-initials="AG"
    :has-notification="true"
    :modules="modules"
    @learn="handleHome"
    @settings="() => {}"
    @notifications="() => {}"
    @user="() => {}"
    @module-select="handleModuleSelect"
    @click="handleBreadcrumbClick"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkflowsStore } from '~/stores/workflows'
import { useUIStore } from '~/stores/ui'

interface Crumb { label: string; href?: string }

const SUB_LABELS: Record<string, string> = {
  'qr-codes':    'QR Codes',
  graphe:        'Traçabilité',
  agents:        'Équipe',
  producteurs:   'Producteurs',
}

const route    = useRoute()
const router   = useRouter()
const store    = useWorkflowsStore()

const activeSegment = computed(() => route.path.split('/').filter(Boolean)[0] ?? '')

const navState = computed(() => {
  if (activeSegment.value === 'source') return 'Source'
  if (activeSegment.value === 'id')     return 'ID'
  return 'Accueil'
})

const modules = computed(() => [
  { name: 'Trace',   label: 'Trace',   active: false,                              disabled: true  },
  { name: 'Carbone', label: 'Carbone', active: false,                              disabled: true  },
  { name: 'Source',  label: 'Source',  active: activeSegment.value === 'source',   disabled: false },
  { name: 'Call',    label: 'Call',    active: false,                              disabled: true  },
  { name: 'Scan',    label: 'Scan',    active: false,                              disabled: true  },
  { name: 'Data',    label: 'Data',    active: false,                              disabled: true  },
  { name: 'ID',      label: 'ID',      active: activeSegment.value === 'id',       disabled: false },
  { name: 'Redd+',   label: 'Redd+',   active: false,                              disabled: true  },
  { name: 'Survey',  label: 'Survey',  active: false,                              disabled: true  },
  { name: 'Yield',   label: 'Yield',   active: false,                              disabled: true  },
  { name: 'Forest',  label: 'Forest',  active: false,                              disabled: true  },
])

const breadcrumbs = computed<Crumb[]>(() => {
  const segments = route.path.split('/').filter(Boolean)

  // ── Source / workflows ───────────────────────────────────────────
  if (segments[0] === 'source') {
    if (segments.length <= 2) return [{ label: 'Source' }]
    const wf     = store.workflows.find((w) => w.id === segments[2])
    const wfName = wf?.name ?? segments[2]
    const wfHref = `/source/workflows/${segments[2]}`
    if (segments.length === 3) return [{ label: 'Source', href: '/source/workflows' }, { label: wfName }]
    const subLabel = SUB_LABELS[segments[3]] ?? segments[3]
    if (segments.length === 4) return [
      { label: 'Source', href: '/source/workflows' },
      { label: wfName,   href: wfHref              },
      { label: subLabel                             },
    ]
    return [
      { label: 'Source',  href: '/source/workflows'           },
      { label: wfName,    href: wfHref                        },
      { label: subLabel,  href: `${wfHref}/${segments[3]}`   },
      { label: segments[4]                                    },
    ]
  }

  // ── ID / KYF ─────────────────────────────────────────────────────
  if (segments[0] === 'id') {
    if (segments.length === 1) return [{ label: 'ID' }]
    const pageLabel = SUB_LABELS[segments[1]] ?? segments[1]
    return [
      { label: 'ID', href: '/id' },
      { label: pageLabel           },
    ]
  }

  return []
})

const dsBreadcrumbs = computed(() =>
  breadcrumbs.value.map((c, i) => ({
    label:  c.label,
    active: i === breadcrumbs.value.length - 1,
  }))
)

const uiStore = useUIStore()

async function handleModuleSelect(mod: { name: string }) {
  const target = mod.name === 'Source' ? '/source/workflows' : mod.name === 'ID' ? '/id' : null
  if (!target || route.path.startsWith(target)) return
  uiStore.moduleTransition = true
  await Promise.all([
    router.push(target),
    new Promise<void>(r => setTimeout(r, 2000)),
  ])
  uiStore.moduleTransition = false
}

const CRUMB_ROUTES: Record<string, string> = {
  Source: '/source/workflows',
  ID:     '/id',
}

function handleBreadcrumbClick(e: MouseEvent) {
  const btn = (e.target as HTMLElement).closest?.('.ds-hnav__crumb-btn')
  if (!btn) return
  const label = btn.textContent?.trim() ?? ''
  const target = CRUMB_ROUTES[label]
  if (target && route.path !== target) router.push(target)
}

async function handleHome() {
  const seg      = route.path.split('/').filter(Boolean)
  const inSource = seg[0] === 'source'
  const inId     = seg[0] === 'id'

  if (inSource && seg.length > 2) {
    router.push('/source/workflows')
    return
  }

  if (inId && seg.length > 1) {
    router.push('/id')
    return
  }

  if (inSource || inId) {
    uiStore.moduleTransition = true
    await Promise.all([router.push('/'), new Promise<void>(r => setTimeout(r, 2000))])
    uiStore.moduleTransition = false
    return
  }

  router.push('/')
}
</script>
