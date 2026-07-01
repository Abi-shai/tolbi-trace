<template>
  <aside
    class="flex shrink-0 h-full bg-white border-r border-border sidebar-width-transition"
    :style="{ width: collapsed ? `${W.collapsed}px` : `${W.expanded}px` }"
  >
    <!-- Icon rail (80px) -->
    <div :class="cn('relative z-10 flex flex-col w-[80px] shrink-0 pt-4', !collapsed && 'border-r border-border')">

      <!-- Layer collapsed : module + icônes des formulaires du projet -->
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
          <DsModuleIcon module="Data" :size="48" class="shrink-0" />
          <div class="w-full h-px bg-border mt-4" />
        </div>
        <div class="flex flex-col gap-2 px-4">
          <NavIconBtn
            v-for="tab in tabs"
            :key="tab.key"
            :icon="tab.icon"
            :label="tab.label"
            :active="tab.key === activeTab"
            @click="onTab(tab)"
          />
        </div>
      </div>

      <!-- Layer expanded : module + retour au projet -->
      <div
        class="absolute inset-0 flex flex-col pt-4 transition-opacity duration-150"
        :style="{ opacity: collapsed ? 0 : 1, pointerEvents: collapsed ? 'none' : 'auto' }"
      >
        <div class="flex flex-col items-center px-2 mb-6">
          <DsModuleIcon module="Data" :size="48" class="shrink-0" />
          <div class="w-full h-px bg-border mt-4" />
        </div>
        <div class="flex flex-col gap-2 px-4">
          <NavIconBtn :icon="Folder" label="Retour au projet" :active="false" @click="goProject" />
        </div>
      </div>
    </div>

    <!-- Text panel (expanded) : nom du formulaire + ses onglets de configuration -->
    <div
      class="flex flex-col flex-1 min-w-0 px-4 py-4 gap-6 overflow-y-auto transition-opacity duration-200"
      :style="{ opacity: collapsed ? 0 : 1, pointerEvents: collapsed ? 'none' : 'auto' }"
    >
      <div class="flex items-center justify-between gap-2 shrink-0">
        <p class="text-xl font-semibold text-text-primary leading-[30px] truncate">{{ formulaire?.name ?? 'Formulaire' }}</p>
        <IconBtn tooltip="Réduire" @click="uiStore.toggleSidebar()">
          <ChevronsLeft :size="20" />
        </IconBtn>
      </div>
      <nav class="flex flex-col gap-1">
        <NavTextBtn
          v-for="tab in tabs"
          :key="tab.key"
          :icon="tab.icon"
          :label="tab.label"
          :active="tab.key === activeTab"
          @click="onTab(tab)"
        />
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { reactive, computed, defineComponent, resolveComponent, h, Teleport, ref, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronsLeft, ChevronsRight, Folder, ListChecks, Users, Inbox, BarChart3 } from 'lucide-vue-next'
import { cn } from '~/lib/utils'
import { useUIStore } from '~/stores/ui'
import { useDataOsStore } from '~/stores/dataos'

const W       = { collapsed: 80, expanded: 320 } as const
const route   = useRoute()
const router  = useRouter()
const uiStore = useUIStore()
const store   = useDataOsStore()

// Contexte : la sidebar double accompagne la configuration d'un formulaire.
const projetId   = computed(() => String(route.params.id ?? ''))
const formId     = computed(() => String(route.params.formId ?? ''))
const formulaire = computed(() => store.formulaireById(formId.value))

// Onglets de configuration du formulaire — liste plate, sans sectionnage.
interface FormTab { key: string; label: string; icon: Component }
const tabs: FormTab[] = [
  { key: 'questions', label: 'Questions',          icon: ListChecks },
  { key: 'dashboard', label: 'Suivi des réponses', icon: Inbox },
  { key: 'analytics', label: 'Analytiques',        icon: BarChart3 },
  { key: 'agents',    label: 'Agents',             icon: Users },
]

// Onglet actif déduit de la route (Questions par défaut, Tableau de bord sur sa vue).
const activeTab = computed(() =>
  route.path.endsWith('/tableau-de-bord') ? 'dashboard' : 'questions',
)

function onTab(tab: FormTab) {
  const base = `/dataos/projets/${projetId.value}/formulaires/${formId.value}`
  if (tab.key === 'questions')      router.push(base)
  else if (tab.key === 'dashboard') router.push(`${base}/tableau-de-bord`)
  // Les autres onglets (Agents, Analytiques) auront leurs vues plus tard.
}

function goProject() {
  // Le formulaire existe déjà : retour simple au projet, sans overlay.
  router.push(`/dataos/projets/${projetId.value}`)
}

const collapsed = computed(() => uiStore.sidebarCollapsed)

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
      // Figma : l'icône reste #667085 (text-quaternary) dans les deux états —
      // seuls la couleur du texte et le fond changent entre actif/inactif.
      h(props.icon as any, { size: 24, class: 'text-text-quaternary' }),
      props.label,
    ])
  },
})
</script>
