<template>
  <DsHNav
    :state="navState"
    :breadcrumbs="dsBreadcrumbs"
    :credits="session.creditsRemaining"
    :credit-state="creditState"
    credit-context="home"
    :user-initials="session.userInitials"
    :has-notification="true"
    :modules="modules"
    @learn="handleHome"
    @settings="goToSettings"
    @notifications="() => {}"
    @user="goToAccount"
    @module-select="handleModuleSelect"
    @click="handleBreadcrumbClick"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkflowsStore } from '~/stores/workflows'
import { useDataOsStore } from '~/stores/dataos'
import { useUIStore } from '~/stores/ui'
import { useSessionStore } from '~/stores/session'

interface Crumb { label: string; href?: string }

const SUB_LABELS: Record<string, string> = {
  'qr-codes':        'QR Codes',
  graphe:            'Traçabilité',
  agents:            'Équipe',
  producteurs:       'Producteurs',
  projets:           'Projets',
  cartes:            'Cartes',
  identites:         'Identités numériques agricoles',
  transactions:      'Transactions',
}

const route    = useRoute()
const router   = useRouter()
const store       = useWorkflowsStore()
const dataosStore = useDataOsStore()
const session     = useSessionStore()
session.init()

const creditState = computed(() => {
  const c = session.creditsRemaining
  return c <= 0 ? 'empty' : c <= 20 ? 'low' : 'good'
})

const activeSegment = computed(() => route.path.split('/').filter(Boolean)[0] ?? '')

const navState = computed(() => {
  if (activeSegment.value === 'source') return 'Source'
  if (activeSegment.value === 'id')     return 'ID'
  if (activeSegment.value === 'ina')    return 'ID'   // INA réutilise l'icône ID
  if (activeSegment.value === 'dataos') return 'Data'
  return 'Accueil'
})

const modules = computed(() => [
  { name: 'Trace',   label: 'Trace',   active: false,                              disabled: true  },
  { name: 'Carbone', label: 'Carbone', active: false,                              disabled: true  },
  { name: 'Source',  label: 'Source',  active: activeSegment.value === 'source',   disabled: false },
  { name: 'Call',    label: 'Call',    active: false,                              disabled: true  },
  { name: 'Scan',    label: 'Scan',    active: false,                              disabled: true  },
  { name: 'Data',    label: 'Data',    active: activeSegment.value === 'dataos',   disabled: false },
  { name: 'ID',      label: 'ID',      active: activeSegment.value === 'id',       disabled: false },
  // INA : même icône de marque que ID (name 'ID'), distingué par le label.
  { name: 'ID',      label: 'INA',     active: activeSegment.value === 'ina',      disabled: false },
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

  // ── INA ──────────────────────────────────────────────────────────
  if (segments[0] === 'ina') {
    if (segments.length === 1) return [{ label: 'INA' }]
    const pageLabel = SUB_LABELS[segments[1]] ?? segments[1]
    return [
      { label: 'INA', href: '/ina' },
      { label: pageLabel            },
    ]
  }

  // ── Paramètres (cross-module) ────────────────────────────────────
  if (segments[0] === 'parametres') return [{ label: 'Paramètres' }]

  // ── Data OS ──────────────────────────────────────────────────────
  if (segments[0] === 'dataos') {
    if (segments.length === 1) return [{ label: 'Data OS' }]
    // Détail d'un projet : Data OS › Projets › <projet>.
    // On ne prolonge la breadcrumb que pour un formulaire — l'aperçu d'un template
    // reste au niveau du projet (le template n'est pas un niveau de navigation).
    if (segments[1] === 'projets' && segments.length >= 3) {
      const projet = dataosStore.projetById(segments[2])
      const inFormulaire = segments[3] === 'formulaires' && !!segments[4]
      const crumbs: Crumb[] = [
        { label: 'Data OS', href: '/dataos'          },
        { label: 'Projets', href: '/dataos/projets'  },
        { label: projet?.name ?? segments[2], href: inFormulaire ? `/dataos/projets/${segments[2]}` : undefined },
      ]
      if (inFormulaire) {
        const form = dataosStore.formulaireById(segments[4])
        crumbs.push({ label: form?.name ?? 'Formulaire' })
      }
      return crumbs
    }
    const pageLabel = SUB_LABELS[segments[1]] ?? segments[1]
    return [
      { label: 'Data OS', href: '/dataos' },
      { label: pageLabel                   },
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

async function handleModuleSelect(mod: { name: string; label: string }) {
  // On route par label : INA partage le name 'ID' (même icône) mais un label distinct.
  const target = mod.label === 'Source' ? '/source/workflows'
    : mod.label === 'ID'   ? '/id'
    : mod.label === 'INA'  ? '/ina'
    : mod.label === 'Data' ? '/dataos'
    : null
  if (!target || route.path.startsWith(target)) return
  uiStore.moduleTransition = true
  await Promise.all([
    router.push(target),
    new Promise<void>(r => setTimeout(r, 2000)),
  ])
  uiStore.moduleTransition = false
}

const CRUMB_ROUTES: Record<string, string> = {
  Source:    '/source/workflows',
  ID:        '/id',
  INA:       '/ina',
  'Data OS': '/dataos',
  Projets:   '/dataos/projets',
}

function handleBreadcrumbClick(e: MouseEvent) {
  const btn = (e.target as HTMLElement).closest?.('.ds-hnav__crumb-btn')
  if (!btn) return
  const label = btn.textContent?.trim() ?? ''
  // On suit le href du crumb (gère les noms dynamiques : projet, formulaire),
  // avec repli sur la table statique pour les libellés fixes des modules.
  const target = breadcrumbs.value.find((c) => c.label === label && c.href)?.href
    ?? CRUMB_ROUTES[label]
  if (target && route.path !== target) router.push(target)
}

function goToSettings() {
  if (route.path !== '/parametres') router.push('/parametres')
}

function goToAccount() {
  router.push({ path: '/parametres', query: { onglet: 'compte' } })
}

async function handleHome() {
  const seg      = route.path.split('/').filter(Boolean)
  const inSource = seg[0] === 'source'
  const inId     = seg[0] === 'id'
  const inIna    = seg[0] === 'ina'
  const inDataos = seg[0] === 'dataos'

  if (inSource && seg.length > 2) {
    router.push('/source/workflows')
    return
  }

  if (inId && seg.length > 1) {
    router.push('/id')
    return
  }

  if (inIna && seg.length > 1) {
    router.push('/ina')
    return
  }

  if (inDataos && seg.length > 1) {
    router.push('/dataos')
    return
  }

  if (inSource || inId || inIna || inDataos) {
    uiStore.moduleTransition = true
    await Promise.all([router.push('/'), new Promise<void>(r => setTimeout(r, 2000))])
    uiStore.moduleTransition = false
    return
  }

  router.push('/')
}
</script>
