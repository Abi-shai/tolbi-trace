<template>
  <!-- ── Inside a workflow ─────────────────────────────────────────────────── -->
  <template v-if="workflow">
    <aside
      class="flex shrink-0 h-full bg-white border-r border-border overflow-hidden sidebar-width-transition"
      :style="{ width: collapsed ? `${W.collapsed}px` : `${W.expanded}px` }"
    >
      <!-- Icon rail (always 80px wide) -->
      <div :class="cn('relative flex flex-col w-[80px] shrink-0 pt-4', !collapsed && 'border-r border-border')">

        <!-- Expand btn + module icon + divider -->
        <div class="flex flex-col items-center gap-4 px-2 mb-6">
          <IconBtn
            tooltip="Afficher la navigation"
            :class="['transition-opacity duration-150', collapsed ? 'opacity-100' : 'opacity-0 pointer-events-none']"
            @click="uiStore.toggleSidebar()"
          >
            <ChevronsRight :size="20" />
          </IconBtn>
          <img :src="'/icons/trace-module.svg'" alt="Trace" width="48" height="48" class="shrink-0" />
          <div class="w-full h-px bg-border" />
        </div>

        <!-- Nav icons zone: two layers overlapping via absolute -->
        <div class="relative flex-1">
          <!-- Collapsed: all nav icons -->
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

          <!-- Expanded: Route (back) icon only -->
          <div
            class="absolute inset-x-0 top-0 flex flex-col gap-2 px-4 transition-opacity duration-150"
            :style="{ opacity: collapsed ? 0 : 1, pointerEvents: collapsed ? 'none' : 'auto' }"
          >
            <NavIconBtn :icon="Route" label="Processus" :active="false" @click="navigate('/workflows')" />
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
    class="relative flex flex-col shrink-0 h-full bg-white border-r border-border overflow-hidden sidebar-width-transition"
    :style="{ width: collapsed ? `${W.collapsed}px` : `${W.expanded}px` }"
  >
    <!-- Collapsed layer -->
    <div
      class="absolute inset-0 flex flex-col py-4 gap-6 transition-opacity duration-150"
      :style="{ opacity: collapsed ? 1 : 0, pointerEvents: collapsed ? 'auto' : 'none' }"
    >
      <div class="flex flex-col items-center gap-4 px-2">
        <IconBtn tooltip="Afficher la navigation" @click="uiStore.toggleSidebar()">
          <ChevronsRight :size="20" />
        </IconBtn>
        <img :src="'/icons/trace-module.svg'" alt="Trace" width="48" height="48" class="shrink-0" />
        <div class="w-full h-px bg-border" />
      </div>
      <div class="flex flex-col gap-2 px-4">
        <NavIconBtn :icon="Route" label="Processus" :active="processusActive" @click="router.push('/workflows')" />
      </div>
    </div>

    <!-- Expanded layer -->
    <div
      class="absolute inset-0 flex flex-col py-4 gap-6 transition-opacity duration-150"
      :style="{ opacity: collapsed ? 0 : 1, pointerEvents: collapsed ? 'none' : 'auto' }"
    >
      <div class="flex items-center gap-3 px-4">
        <img :src="'/icons/trace-module.svg'" alt="Trace" width="48" height="48" class="shrink-0" />
        <span class="flex-1 text-xl font-semibold text-text-primary leading-[30px] whitespace-nowrap">Trace</span>
        <IconBtn tooltip="Réduire" @click="uiStore.toggleSidebar()">
          <ChevronsLeft :size="20" />
        </IconBtn>
      </div>
      <nav class="px-4">
        <NavTextBtn :icon="Route" label="Processus" :active="processusActive" @click="router.push('/workflows')" />
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, h, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Network, ChevronsLeft, ChevronsRight, QrCode, Users, Route, AlignRight } from 'lucide-vue-next'
import { cn } from '~/lib/utils'
import { useWorkflowsStore } from '~/stores/workflows'
import { useWorkflowBuilderStore } from '~/stores/workflow-builder'
import { useUIStore } from '~/stores/ui'
import UnsavedChangesModal from '~/components/workflow-canvas/UnsavedChangesModal.vue'

const W = { collapsed: 80, expanded: 320 } as const

// ─── IconBtn (collapse/expand) avec tooltip CSS ────────────────────────────────

const IconBtn = defineComponent({
  props: { tooltip: { type: String, required: true } },
  emits: ['click'],
  setup(props, { slots, emit }) {
    return () => h('div', { class: 'group relative flex items-center justify-center' }, [
      h('button', {
        onClick: () => emit('click'),
        class: 'flex items-center justify-center p-2 rounded-lg border border-border text-text-muted hover:bg-surface transition-colors shrink-0',
      }, slots.default?.()),
      h('div', { class: 'absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex items-center gap-1.5' }, [
        h('div', { style: 'flex-shrink:0;width:0;height:0;border-top:5px solid transparent;border-bottom:5px solid transparent;border-right:6px solid #101828' }),
        h('span', { class: 'bg-overlay text-white text-xs font-semibold px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-lg' }, props.tooltip),
      ]),
    ])
  },
})

// ─── NavIconBtn avec tooltip CSS ──────────────────────────────────────────────

const NavIconBtn = defineComponent({
  props: {
    icon:   { type: Object as () => Component, required: true },
    label:  { type: String, required: true },
    active: { type: Boolean, required: true },
  },
  emits: ['click'],
  setup(props, { emit }) {
    return () => h('div', { class: 'group relative' }, [
      h('button', {
        onClick: () => emit('click'),
        class: cn(
          'flex items-center justify-center w-12 h-12 rounded-[6px] transition-colors',
          props.active ? 'bg-surface text-text-nav-hover' : 'bg-white text-text-muted hover:bg-surface hover:text-text-nav-hover',
        ),
      }, [h(props.icon as any, { size: 24 })]),
      h('div', { class: 'absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex items-center gap-1.5' }, [
        h('div', { style: 'flex-shrink:0;width:0;height:0;border-top:5px solid transparent;border-bottom:5px solid transparent;border-right:6px solid #101828' }),
        h('span', { class: 'bg-overlay text-white text-xs font-semibold px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-lg' }, props.label),
      ]),
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
      h(props.icon as any, { size: 24, class: props.active ? 'text-text-secondary' : 'text-text-muted' }),
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
const workflowMatch   = computed(() => route.path.match(/^\/workflows\/([^/]+)/))
const workflowId      = computed(() => workflowMatch.value?.[1])
const workflow        = computed(() => workflowId.value ? wfStore.workflows.find((w) => w.id === workflowId.value) : null)
const isCanvasPage    = computed(() => route.path === `/workflows/${workflowId.value}`)
const processusActive = computed(() => route.path === '/workflows' || route.path.startsWith('/workflows/'))

const pendingHref = ref<string | null>(null)

const navGroups = computed(() => {
  const base = `/workflows/${workflow.value?.id}`
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
  const base = `/workflows/${workflowId.value}`
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
