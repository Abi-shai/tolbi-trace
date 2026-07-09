<template>
  <aside
    class="relative flex shrink-0 h-full bg-white border-r border-border sidebar-width-transition overflow-hidden"
    :style="{ width: collapsed ? `${W.collapsed}px` : `${W.expanded}px` }"
  >
    <!-- Couche repliée (80px) -->
    <div
      class="absolute inset-0 flex flex-col items-center pt-4 transition-opacity duration-150"
      :style="{ opacity: collapsed ? 1 : 0, pointerEvents: collapsed ? 'auto' : 'none' }"
    >
      <div class="flex flex-col items-center px-2 mb-4 w-full">
        <div class="w-full flex justify-center pb-4">
          <IconBtn tooltip="Afficher la navigation" @click="uiStore.toggleSidebar()">
            <ChevronsRight :size="20" />
          </IconBtn>
        </div>
        <DsModuleIcon module="ID" :size="48" class="shrink-0" />
        <OrgSwitcher variant="rail" class="mt-3" />
        <div class="w-full h-px bg-border mt-4" />
      </div>
      <div class="flex flex-col gap-2 px-4">
        <NavIconBtn v-for="n in nav" :key="n.href" :icon="n.icon" :label="n.label" :active="isActive(n.href)" @click="router.push(n.href)" />
      </div>
    </div>

    <!-- Couche dépliée (320px) -->
    <div
      class="absolute inset-0 flex flex-col px-4 py-4 gap-6 overflow-y-auto transition-opacity duration-200"
      :style="{ opacity: collapsed ? 0 : 1, pointerEvents: collapsed ? 'none' : 'auto' }"
    >
      <div class="flex items-center justify-between gap-2 shrink-0">
        <div class="flex items-center gap-2.5 min-w-0">
          <DsModuleIcon module="ID" :size="40" class="shrink-0" />
          <p class="text-xl font-semibold text-text-primary leading-[30px] truncate">INA</p>
        </div>
        <IconBtn tooltip="Réduire" @click="uiStore.toggleSidebar()">
          <ChevronsLeft :size="20" />
        </IconBtn>
      </div>
      <OrgSwitcher variant="full" />
      <nav class="flex flex-col gap-1">
        <NavTextBtn v-for="n in nav" :key="n.href" :icon="n.icon" :label="n.label" :active="isActive(n.href)" @click="router.push(n.href)" />
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, reactive, computed, defineComponent, resolveComponent, h, Teleport, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronsLeft, ChevronsRight, CreditCard, Fingerprint, ArrowLeftRight } from 'lucide-vue-next'
import { cn } from '~/lib/utils'
import { useUIStore } from '~/stores/ui'

const W       = { collapsed: 80, expanded: 320 } as const
const route   = useRoute()
const router  = useRouter()
const uiStore = useUIStore()

const collapsed = computed(() => uiStore.sidebarCollapsed)

const nav = [
  { label: 'Identités numériques agricoles', href: '/ina/identites',    icon: Fingerprint     },
  { label: 'Cartes',                         href: '/ina/cartes',       icon: CreditCard      },
  { label: 'Transactions',                   href: '/ina/transactions', icon: ArrowLeftRight  },
]

function isActive(href: string) {
  return route.path === href || route.path.startsWith(href + '/')
}

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

const NavIconBtn = defineComponent({
  props: {
    icon:   { type: [Object, Function] as unknown as () => Component, required: true },
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

const NavTextBtn = defineComponent({
  props: {
    icon:   { type: [Object, Function] as unknown as () => Component, required: true },
    label:  { type: String, required: true },
    active: { type: Boolean, required: true },
  },
  emits: ['click'],
  setup(props, { emit }) {
    return () => h('button', {
      onClick: () => emit('click'),
      class: cn(
        'flex items-center gap-3 w-full px-3 py-2 rounded-[6px] text-base font-semibold transition-colors',
        props.active ? 'bg-surface text-text-nav-hover' : 'bg-white text-text-secondary hover:bg-surface hover:text-text-nav-hover',
      ),
    }, [
      h(props.icon as any, { size: 24, class: `shrink-0 ${props.active ? 'text-text-secondary' : 'text-text-quaternary'}` }),
      h('span', { class: 'flex-1 min-w-0 truncate text-left' }, props.label),
    ])
  },
})
</script>
