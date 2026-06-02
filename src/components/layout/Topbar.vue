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

const modules = [
  { name: 'Source',   label: 'Source',   active: false, disabled: false },
  { name: 'Carbone', label: 'Carbone', active: false, disabled: false },
  { name: 'Source',  label: 'Source',  active: true,  disabled: false },
  { name: 'Call',    label: 'Call',    active: false, disabled: false },
  { name: 'Scan',    label: 'Scan',    active: false, disabled: false },
  { name: 'Data',    label: 'Data',    active: false, disabled: false },
  { name: 'ID',      label: 'ID',      active: false, disabled: false },
  { name: 'Redd+',   label: 'Redd+',   active: false, disabled: false },
  { name: 'Survey',  label: 'Survey',  active: false, disabled: false },
  { name: 'Yield',   label: 'Yield',   active: false, disabled: false },
  { name: 'Forest',  label: 'Forest',  active: false, disabled: false },
]

interface Crumb {
  label: string
  href?: string
}

const SUB_LABELS: Record<string, string> = {
  'qr-codes': 'QR Codes',
  graphe:     'Traçabilité',

  agents:     'Équipe',
}

const route    = useRoute()
const router   = useRouter()
const store    = useWorkflowsStore()

const navState = computed(() => {
  const segments = route.path.split('/').filter(Boolean)
  return segments[0] === 'workflows' ? 'Source' : 'Accueil'
})

const breadcrumbs = computed<Crumb[]>(() => {
  const pathname = route.path
  const segments = pathname.split('/').filter(Boolean)

  if (segments[0] !== 'workflows') return []

  if (segments.length === 1) return [{ label: 'Source' }]

  const wf     = store.workflows.find((w) => w.id === segments[1])
  const wfName = wf?.name ?? segments[1]
  const wfHref = `/workflows/${segments[1]}`

  if (segments.length === 2) {
    return [{ label: 'Source', href: '/workflows' }, { label: wfName }]
  }

  const sub      = segments[2]
  const subLabel = SUB_LABELS[sub] ?? sub

  if (segments.length === 3) {
    return [
      { label: 'Source',  href: '/workflows' },
      { label: wfName,   href: wfHref       },
      { label: subLabel                      },
    ]
  }

  return [
    { label: 'Source',    href: '/workflows'       },
    { label: wfName,     href: wfHref             },
    { label: subLabel,   href: `${wfHref}/${sub}` },
    { label: segments[3]                           },
  ]
})

// DsHNav breadcrumbs: { label, active } — last item is active
const dsBreadcrumbs = computed(() =>
  breadcrumbs.value.map((c, i) => ({
    label:  c.label,
    active: i === breadcrumbs.value.length - 1,
  }))
)

function handleModuleSelect(mod: { name: string }) {
  if (mod.name === 'Source') router.push('/workflows')
}

function handleHome() {
  const segments = route.path.split('/').filter(Boolean)
  if (segments[0] === 'workflows' && segments.length > 1) {
    router.push('/workflows')
  } else {
    router.push('/')
  }
}
</script>
