<template>
  <aside
    class="flex shrink-0 h-full bg-white border-r border-border overflow-hidden sidebar-width-transition"
    :style="{ width: collapsed ? `${W.collapsed}px` : `${W.expanded}px` }"
  >
    <!-- Icon rail (80px) -->
    <div :class="cn('relative flex flex-col w-[80px] shrink-0 pt-4', !collapsed && 'border-r border-border')">

      <!-- Layer collapsed -->
      <div
        class="absolute inset-0 flex flex-col pt-4 transition-opacity duration-150"
        :style="{ opacity: collapsed ? 1 : 0, pointerEvents: collapsed ? 'auto' : 'none' }"
      >
        <div class="flex flex-col items-center px-2 mb-6">
          <div class="w-full flex justify-center pb-4">
            <IconBtn tooltip="Afficher la navigation" @click="uiStore.toggleSidebar()">
              <ChevronsRight :size="20" />
            </IconBtn>
          </div>
          <DsModuleIcon module="ID" :size="48" class="shrink-0" />
          <div class="w-full h-px bg-border mt-4" />
        </div>
        <div class="flex flex-col gap-2 px-4">
          <!-- Add button -->
          <button
            class="flex items-center justify-center w-12 h-12 rounded-md border border-border bg-white text-text-quaternary hover:bg-surface transition-colors shadow-xs"
            @click="$emit('add')"
          >
            <Plus :size="20" />
          </button>
          <!-- Fournisseurs (active) -->
          <NavIconBtn :icon="Users" label="Fournisseurs" :active="isActive('/id/fournisseurs')" @click="router.push('/id/fournisseurs')" />
          <!-- Stats -->
          <NavIconBtn :icon="TrendingUp" label="Statistiques" :active="isActive('/id/stats')" @click="router.push('/id/stats')" />
        </div>
      </div>

      <!-- Layer expanded -->
      <div
        class="absolute inset-0 flex flex-col pt-4 transition-opacity duration-150"
        :style="{ opacity: collapsed ? 0 : 1, pointerEvents: collapsed ? 'none' : 'auto' }"
      >
        <div class="flex flex-col items-center px-2 mb-6">
          <DsModuleIcon module="ID" :size="48" class="shrink-0" />
          <div class="w-full h-px bg-border mt-4" />
        </div>
        <div class="flex flex-col gap-2 px-4">
          <NavIconBtn :icon="Users" label="Fournisseurs" :active="isActive('/id/fournisseurs')" @click="router.push('/id/fournisseurs')" />
          <NavIconBtn :icon="TrendingUp" label="Statistiques" :active="isActive('/id/stats')" @click="router.push('/id/stats')" />
        </div>
      </div>
    </div>

    <!-- Text panel (expanded) -->
    <div
      class="flex flex-col flex-1 min-w-0 px-4 py-4 gap-6 overflow-y-auto transition-opacity duration-200"
      :style="{ opacity: collapsed ? 0 : 1, pointerEvents: collapsed ? 'none' : 'auto' }"
    >
      <div class="flex items-center justify-between gap-2 shrink-0">
        <p class="text-xl font-semibold text-text-primary leading-[30px] whitespace-nowrap">KYF</p>
        <IconBtn tooltip="Réduire" @click="uiStore.toggleSidebar()">
          <ChevronsLeft :size="20" />
        </IconBtn>
      </div>
      <nav class="flex flex-col gap-1">
        <NavTextBtn :icon="Users" label="Fournisseurs" :active="isActive('/id/fournisseurs')" @click="router.push('/id/fournisseurs')" />
        <NavTextBtn :icon="TrendingUp" label="Statistiques" :active="isActive('/id/stats')" @click="router.push('/id/stats')" />
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronsLeft, ChevronsRight, Users, TrendingUp, Plus } from 'lucide-vue-next'
import { cn } from '~/lib/utils'
import { useUIStore } from '~/stores/ui'

defineEmits<{ add: [] }>()

const W       = { collapsed: 80, expanded: 320 } as const
const route   = useRoute()
const router  = useRouter()
const uiStore = useUIStore()

const collapsed = computed(() => uiStore.sidebarCollapsed)

function isActive(href: string) {
  return route.path === href || route.path.startsWith(href + '/')
}

const IconBtn = defineComponent({
  props: { tooltip: { type: String, required: true } },
  emits: ['click'],
  setup(props, { slots, emit }) {
    return () => h('div', { class: 'group relative flex items-center justify-center' }, [
      h('button', {
        onClick: () => emit('click'),
        class: 'flex items-center justify-center p-2 rounded-lg border border-border text-text-quaternary hover:bg-surface transition-colors shrink-0',
      }, slots.default?.()),
      h('div', { class: 'absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex items-center gap-1.5' }, [
        h('div', { style: 'flex-shrink:0;width:0;height:0;border-top:5px solid transparent;border-bottom:5px solid transparent;border-right:6px solid #101828' }),
        h('span', { class: 'bg-overlay text-white text-xs font-semibold px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-lg' }, props.tooltip),
      ]),
    ])
  },
})

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
          props.active ? 'bg-surface text-text-nav-hover' : 'bg-white text-text-quaternary hover:bg-surface hover:text-text-nav-hover',
        ),
      }, [h(props.icon as any, { size: 24 })]),
      h('div', { class: 'absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex items-center gap-1.5' }, [
        h('div', { style: 'flex-shrink:0;width:0;height:0;border-top:5px solid transparent;border-bottom:5px solid transparent;border-right:6px solid #101828' }),
        h('span', { class: 'bg-overlay text-white text-xs font-semibold px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-lg' }, props.label),
      ]),
    ])
  },
})

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
</script>
