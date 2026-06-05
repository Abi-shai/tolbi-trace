<template>
  <!-- ── Inside a workflow ─────────────────────────────────────────────────── -->
  <template v-if="workflow">
    <aside
      class="flex shrink-0 h-full bg-white border-r border-border sidebar-width-transition"
      :style="{ width: collapsed ? `${W.collapsed}px` : `${W.expanded}px` }"
    >
      <!-- Icon rail (always 80px wide) — layout persistant, bouton animé en hauteur -->
      <div :class="cn('relative z-10 flex flex-col w-[80px] shrink-0 pt-4', !collapsed && 'border-r border-border')">

        <div class="flex flex-col items-center px-2 mb-6">
          <!-- Expand btn : se replie en hauteur quand la sidebar est ouverte -->
          <div
            class="w-full flex justify-center"
            :style="{
              transition: 'max-height 0.22s cubic-bezier(0.4,0,0.2,1), opacity 0.15s ease, padding-bottom 0.22s cubic-bezier(0.4,0,0.2,1)',
              maxHeight: collapsed ? '56px' : '0px',
              paddingTop: '4px',
              paddingBottom: collapsed ? '16px' : '0px',
              opacity: collapsed ? 1 : 0,
              pointerEvents: collapsed ? 'auto' : 'none',
            }"
          >
            <IconBtn tooltip="Afficher la navigation" @click="uiStore.toggleSidebar()">
              <ChevronsRight :size="20" />
            </IconBtn>
          </div>
          <DsModuleIcon module="Source" :size="48" class="shrink-0" />
          <div class="w-full h-px bg-border mt-4" />
        </div>

        <!-- Icônes nav : crossfade entre collapsed (toutes) et expanded (retour seul) -->
        <div class="relative flex-1">
          <div
            class="absolute inset-x-0 top-0 flex flex-col gap-2 px-4 transition-opacity duration-150"
            :style="{ opacity: collapsed ? 1 : 0, pointerEvents: collapsed ? 'auto' : 'none' }"
          >
            <template v-for="group in navGroups" :key="group.label">
              <NavIconBtn
                v-for="item in group.items"
                :key="item.href"
                :icon="item.icon"
                :label="item.label"
                :active="isActive(item.href)"
                @click="navigate(item.href)"
              />
            </template>
          </div>
          <div
            class="absolute inset-x-0 top-0 flex flex-col gap-2 px-4 transition-opacity duration-150"
            :style="{ opacity: collapsed ? 0 : 1, pointerEvents: collapsed ? 'none' : 'auto' }"
          >
            <NavIconBtn :icon="Route" label="Processus" :active="false" @click="navigate('/source/workflows')" />
          </div>
        </div>
      </div>

      <!-- Subnav — fades with CSS, no Vue Transition -->
      <div
        class="flex flex-col flex-1 min-w-0 px-4 py-4 gap-6 overflow-y-auto transition-opacity duration-200"
        :style="{ opacity: collapsed ? 0 : 1, pointerEvents: collapsed ? 'none' : 'auto' }"
      >
        <div class="flex items-center justify-between gap-2 shrink-0">
          <p class="text-xl font-semibold text-text-primary leading-[30px] truncate">{{ workflow.name }}</p>
          <IconBtn tooltip="Réduire" @click="uiStore.toggleSidebar()">
            <ChevronsLeft :size="20" />
          </IconBtn>
        </div>

        <div class="flex flex-col gap-6">
          <div v-for="group in navGroups" :key="group.label" class="flex flex-col gap-3">
            <p class="text-base font-medium text-text-tertiary leading-6">{{ group.label }}</p>
            <div class="flex flex-col gap-1">
              <NavTextBtn
                v-for="item in group.items"
                :key="item.href"
                :icon="item.icon"
                :label="item.label"
                :active="isActive(item.href)"
                @click="navigate(item.href)"
              />
            </div>
          </div>
        </div>
      </div>
    </aside>

    <UnsavedChangesModal
      v-if="pendingHref"
      @save="handleSaveAndLeave"
      @discard="handleDiscard"
      @cancel="pendingHref = null"
    />
  </template>

  <!-- ── Outside a workflow ─────────────────────────────────────────────── -->
  <aside
    v-else
    class="flex shrink-0 h-full bg-white border-r border-border sidebar-width-transition"
    :style="{ width: collapsed ? `${W.collapsed}px` : `${W.expanded}px` }"
  >
    <!-- Icon rail (80px) — même logique que l'inside -->
    <div :class="cn('relative z-10 flex flex-col w-[80px] shrink-0 pt-4', !collapsed && 'border-r border-border')">
      <div class="flex flex-col items-center px-2 mb-6">
        <div
          class="w-full flex justify-center"
          :style="{
            transition: 'max-height 0.22s cubic-bezier(0.4,0,0.2,1), opacity 0.15s ease, padding-bottom 0.22s cubic-bezier(0.4,0,0.2,1)',
            maxHeight: collapsed ? '56px' : '0px',
            paddingTop: '4px',
            paddingBottom: collapsed ? '16px' : '0px',
            opacity: collapsed ? 1 : 0,
            pointerEvents: collapsed ? 'auto' : 'none',
          }"
        >
          <IconBtn tooltip="Afficher la navigation" @click="uiStore.toggleSidebar()">
            <ChevronsRight :size="20" />
          </IconBtn>
        </div>
        <DsModuleIcon module="Source" :size="48" class="shrink-0" />
        <div class="w-full h-px bg-border mt-4" />
      </div>
      <div class="flex flex-col gap-2 px-4">
        <NavIconBtn :icon="Route" label="Processus" :active="processusActive" @click="router.push('/source/workflows')" />
      </div>
    </div>

    <!-- Panel texte (fade in quand expanded) -->
    <div
      class="flex flex-col flex-1 min-w-0 px-4 py-4 gap-6 overflow-y-auto transition-opacity duration-200"
      :style="{ opacity: collapsed ? 0 : 1, pointerEvents: collapsed ? 'none' : 'auto' }"
    >
      <div class="flex items-center justify-between gap-2 shrink-0">
        <p class="text-xl font-semibold text-text-primary leading-[30px] whitespace-nowrap">Source</p>
        <IconBtn tooltip="Réduire" @click="uiStore.toggleSidebar()">
          <ChevronsLeft :size="20" />
        </IconBtn>
      </div>
      <nav>
        <NavTextBtn :icon="Route" label="Processus" :active="processusActive" @click="router.push('/source/workflows')" />
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, reactive, computed, defineComponent, resolveComponent, h, Teleport, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Network, ChevronsLeft, ChevronsRight, QrCode, Users, Route, AlignRight } from 'lucide-vue-next'
import { cn } from '~/lib/utils'
import { useWorkflowsStore } from '~/stores/workflows'
import { useWorkflowBuilderStore } from '~/stores/workflow-builder'
import { useUIStore } from '~/stores/ui'
import UnsavedChangesModal from '~/components/workflow-canvas/UnsavedChangesModal.vue'

const W = { collapsed: 80, expanded: 320 } as const

// ─── helpers tooltip teleportés ───────────────────────────────────────────────

function makeTooltipHandlers(pos: { top: number; left: number }, isHovered: { value: boolean }) {
  return {
    onMouseenter(e: MouseEvent) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      pos.top  = rect.top + rect.height / 2
      pos.left = rect.right + 8
      isHovered.value = true
    },
    onMouseleave() { isHovered.value = false },
  }
}

// ─── IconBtn (collapse/expand) ────────────────────────────────────────────────

const IconBtn = defineComponent({
  props: { tooltip: { type: String, required: true } },
  emits: ['click'],
  setup(props, { slots, emit }) {
    const DsTooltipComp = resolveComponent('DsTooltip')
    const isHovered = ref(false)
    const pos = reactive({ top: 0, left: 0 })
    const handlers = makeTooltipHandlers(pos, isHovered)
    return () => h('div', { class: 'flex items-center justify-center', ...handlers }, [
      h('button', {
        onClick: () => emit('click'),
        class: 'flex items-center justify-center p-2 rounded-lg border border-border text-text-quaternary hover:bg-surface transition-colors shrink-0',
      }, slots.default?.()),
      isHovered.value
        ? h(Teleport, { to: 'body' }, [
            h('div', {
              class: 'fixed z-[9999] pointer-events-none -translate-y-1/2',
              style: { top: `${pos.top}px`, left: `${pos.left}px` },
            }, [h(DsTooltipComp, { title: props.tooltip, arrow: 'left' })]),
          ])
        : null,
    ])
  },
})

// ─── NavIconBtn ───────────────────────────────────────────────────────────────

const NavIconBtn = defineComponent({
  props: {
    icon:   { type: Object as () => Component, required: true },
    label:  { type: String, required: true },
    active: { type: Boolean, required: true },
  },
  emits: ['click'],
  setup(props, { emit }) {
    const DsTooltipComp = resolveComponent('DsTooltip')
    const isHovered = ref(false)
    const pos = reactive({ top: 0, left: 0 })
    const handlers = makeTooltipHandlers(pos, isHovered)
    return () => h('div', handlers, [
      h('button', {
        onClick: () => emit('click'),
        class: cn(
          'flex items-center justify-center w-12 h-12 rounded-[6px] transition-colors',
          props.active ? 'bg-surface text-text-nav-hover' : 'bg-white text-text-quaternary hover:bg-surface hover:text-text-nav-hover',
        ),
      }, [h(props.icon as any, { size: 24 })]),
      isHovered.value
        ? h(Teleport, { to: 'body' }, [
            h('div', {
              class: 'fixed z-[9999] pointer-events-none -translate-y-1/2',
              style: { top: `${pos.top}px`, left: `${pos.left}px` },
            }, [h(DsTooltipComp, { title: props.label, arrow: 'left' })]),
          ])
        : null,
    ])
  },
})

// ─── NavTextBtn ───────────────────────────────────────────────────────────────

const NavTextBtn = defineComponent({
  props: {
    icon:   { type: Object as () => Component, required: true },
    label:  { type: String, required: true },
    active: { type: Boolean, required: true },
  },
  emits: ['click'],
  setup(props, { emit }) {
    return () => h('button', {
      onClick: () => emit('click'),
      class: cn(
        'flex items-center gap-3 w-full px-3 py-2 rounded-[6px] text-base font-semibold transition-colors whitespace-nowrap',
        props.active ? 'bg-surface text-text-nav-hover' : 'bg-white text-text-secondary hover:bg-surface hover:text-text-nav-hover',
      ),
    }, [
      h(props.icon as any, { size: 24, class: props.active ? 'text-text-secondary' : 'text-text-quaternary' }),
      props.label,
    ])
  },
})

// ─── Main ─────────────────────────────────────────────────────────────────────

const route   = useRoute()
const router  = useRouter()
const wfStore = useWorkflowsStore()
const builder = useWorkflowBuilderStore()
const uiStore = useUIStore()

wfStore.init()

const collapsed       = computed(() => uiStore.sidebarCollapsed)
const workflowMatch   = computed(() => route.path.match(/^\/source\/workflows\/([^/]+)/))
const workflowId      = computed(() => workflowMatch.value?.[1])
const workflow        = computed(() => workflowId.value ? wfStore.workflows.find((w) => w.id === workflowId.value) : null)
const isCanvasPage    = computed(() => route.path === `/source/workflows/${workflowId.value}`)
const processusActive = computed(() => route.path === '/source/workflows' || route.path.startsWith('/source/workflows/'))

const pendingHref = ref<string | null>(null)

const navGroups = computed(() => {
  const base = `/source/workflows/${workflow.value?.id}`
  return [
    {
      label: 'Configurer',
      items: [
        { href: base,             label: 'Étapes', icon: AlignRight },
        { href: `${base}/agents`, label: 'Agents', icon: Users      },
      ],
    },
    {
      label: 'Observer',
      items: [
        { href: `${base}/graphe`,   label: 'Traçabilité', icon: Network },
        { href: `${base}/qr-codes`, label: 'QR codes',    icon: QrCode  },
      ],
    },
  ]
})

function isActive(href: string) {
  const base = `/source/workflows/${workflowId.value}`
  return route.path === href || (href !== base && route.path.startsWith(href + '/'))
}

function navigate(href: string) {
  if (isCanvasPage.value && builder.hasUnsavedChanges && href !== route.path) {
    pendingHref.value = href
  } else {
    router.push(href)
  }
}

function handleSaveAndLeave() {
  builder.markSaved()
  if (pendingHref.value) router.push(pendingHref.value)
  pendingHref.value = null
}

function handleDiscard() {
  if (pendingHref.value) router.push(pendingHref.value)
  pendingHref.value = null
}
</script>
