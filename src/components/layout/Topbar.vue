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
  fournisseurs:  'Fournisseurs',
}

const route    = useRoute()
const router   = useRouter()
const store    = useWorkflowsStore()

const activeSegment = computed(() => route.path.split('/').filter(Boolean)[0] ?? '')

const navState = computed(() => {
  if (activeSegment.value === 'workflows') return 'Source'
  if (activeSegment.value === 'id')        return 'KYF'
  return 'Accueil'
})

const modules = computed(() => [
  { name: 'Trace',   label: 'Trace',   active: false,                               disabled: true  },
  { name: 'Carbone', label: 'Carbone', active: false,                               disabled: true  },
  { name: 'Source',  label: 'Source',  active: activeSegment.value === 'workflows', disabled: false },
  { name: 'Call',    label: 'Call',    active: false,                               disabled: true  },
  { name: 'Scan',    label: 'Scan',    active: false,                               disabled: true  },
  { name: 'Data',    label: 'Data',    active: false,                               disabled: true  },
  { name: 'ID',      label: 'ID',      active: activeSegment.value === 'id',        disabled: false },
  { name: 'Redd+',   label: 'Redd+',   active: false,                               disabled: true  },
  { name: 'Survey',  label: 'Survey',  active: false,                               disabled: true  },
  { name: 'Yield',   label: 'Yield',   active: false,                               disabled: true  },
  { name: 'Forest',  label: 'Forest',  active: false,                               disabled: true  },
])

const breadcrumbs = computed<Crumb[]>(() => {
  const segments = route.path.split('/').filter(Boolean)

  // ── Source / workflows ───────────────────────────────────────────
  if (segments[0] === 'workflows') {
    if (segments.length === 1) return [{ label: 'Source' }]
    const wf     = store.workflows.find((w) => w.id === segments[1])
    const wfName = wf?.name ?? segments[1]
    const wfHref = `/workflows/${segments[1]}`
    if (segments.length === 2) return [{ label: 'Source', href: '/workflows' }, { label: wfName }]
    const subLabel = SUB_LABELS[segments[2]] ?? segments[2]
    if (segments.length === 3) return [
      { label: 'Source', href: '/workflows' },
      { label: wfName,   href: wfHref       },
      { label: subLabel                      },
    ]
    return [
      { label: 'Source',   href: '/workflows'             },
      { label: wfName,     href: wfHref                   },
      { label: subLabel,   href: `${wfHref}/${segments[2]}` },
      { label: segments[3]                                 },
    ]
  }

  // ── ID / KYF ─────────────────────────────────────────────────────
  if (segments[0] === 'id') {
    if (segments.length === 1) return [{ label: 'KYF' }]
    const pageLabel = SUB_LABELS[segments[1]] ?? segments[1]
    return [
      { label: 'KYF', href: '/id' },
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
  const target = mod.name === 'Source' ? '/workflows' : mod.name === 'ID' ? '/id' : null
  if (!target || route.path.startsWith(target)) return
  uiStore.moduleTransition = true
  await Promise.all([
    router.push(target),
    new Promise<void>(r => setTimeout(r, 2000)),
  ])
  uiStore.moduleTransition = false
}

async function handleHome() {
  const seg = route.path.split('/').filter(Boolean)
  const inWorkflows = seg[0] === 'workflows'
  const inId        = seg[0] === 'id'

  if ((inWorkflows || inId) && seg.length > 1) {
    // Intra-module: go to module root — no transition
    router.push(inWorkflows ? '/workflows' : '/id')
    return
  }

  if (inWorkflows || inId) {
    // Module exit: go to home — fire transition
    uiStore.moduleTransition = true
    await Promise.all([router.push('/'), new Promise<void>(r => setTimeout(r, 2000))])
    uiStore.moduleTransition = false
    return
  }

  router.push('/')
}
</script>
